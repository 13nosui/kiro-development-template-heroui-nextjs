// Figma Dev Mode MCPサーバー用APIエンドポイント（雛形）

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";
import { validators, createValidationErrorResponse } from "../../lib/validation";
import { security } from "../../lib/security";
import { getEnvVar } from "../../lib/env";

// Figma Webhookの署名検証
function verifySignature(req: NextApiRequest, secret: string) {
  const signature = req.headers["x-figma-signature"];
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const body =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  hmac.update(body);
  const digest = hmac.digest("hex");
  return signature === digest;
}

async function fetchFigmaNode(fileId: string, nodeId: string, token: string) {
  const url = `https://api.figma.com/v1/files/${fileId}/nodes?ids=${nodeId}`;
  const res = await axios.get(url, {
    headers: { "X-Figma-Token": token },
  });
  return res.data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // セキュリティヘッダーの設定
  const securityHeaders = security.api.generateSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // GET /api/figma-mcp?fileId=...&nodeId=...
  if (req.method === "GET") {
    const { fileId, nodeId } = req.query;
    
    if (!fileId || !nodeId) {
      return res
        .status(400)
        .json({ error: "Missing fileId or nodeId parameters" });
    }
    
    // 環境変数の安全な取得
    const figmaAccessToken = getEnvVar('FIGMA_ACCESS_TOKEN');
    const figmaPersonalToken = getEnvVar('FIGMA_PERSONAL_ACCESS_TOKEN');
    const token = figmaAccessToken || figmaPersonalToken;
    
    if (!token) {
      return res
        .status(500)
        .json({ 
          error: "Figma access token not configured. Please set FIGMA_ACCESS_TOKEN or FIGMA_PERSONAL_ACCESS_TOKEN environment variable.",
          debug: {
            figmaAccessToken: figmaAccessToken ? 'set' : 'not set',
            figmaPersonalToken: figmaPersonalToken ? 'set' : 'not set'
          }
        });
    }

    // パラメータのバリデーション
    const validationResult = validators.figmaMcpRequest({ 
      fileId: fileId as string, 
      nodeId: nodeId as string 
    });
    
    if (!validationResult.success) {
      security.logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        input: `fileId: ${fileId}, nodeId: ${nodeId}`,
        ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || '',
      });
      
      return res.status(400).json(createValidationErrorResponse(validationResult.errors!));
    }

    // 入力値のセキュリティチェック
    const fileIdCheck = security.api.validateAndSanitize(fileId as string);
    const nodeIdCheck = security.api.validateAndSanitize(nodeId as string);
    
    if (!fileIdCheck.isValid || !nodeIdCheck.isValid) {
      security.logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        input: `fileId: ${fileId}, nodeId: ${nodeId}`,
        ip: req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || 'unknown',
        userAgent: req.headers['user-agent'] || '',
      });
      
      const errors = [...(fileIdCheck.errors || []), ...(nodeIdCheck.errors || [])];
      return res.status(400).json(createValidationErrorResponse(errors));
    }

    try {
      const data = await fetchFigmaNode(
        fileIdCheck.sanitized!,
        nodeIdCheck.sanitized!,
        token
      );
      
      // レスポンスデータのサニタイゼーション
      const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
        if (typeof value === 'string') {
          return security.xss.filterXSS(value);
        }
        return value;
      }));
      
      return res.status(200).json(sanitizedData);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      return res.status(500).json({ error: errorMessage });
    }
  }

  // POST (Webhook)は従来通り
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const secret = getEnvVar('FIGMA_WEBHOOK_SECRET');
  if (!secret) {
    return res.status(500).json({ 
      error: "Figma webhook secret not configured. Please set FIGMA_WEBHOOK_SECRET environment variable." 
    });
  }
  
  if (!verifySignature(req, secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Figmaからのリクエストボディをパース
  const event = req.body;
  // ここでイベント種別ごとに処理を分岐
  if (event && event.event_type) {
    // 例: ファイル更新イベント
    if (event.event_type === "FILE_UPDATE") {
      // 必要に応じてFigma APIへアクセス
      return res
        .status(200)
        .json({ message: "ファイル更新イベントを受信しました" });
    }
    // 他のイベントもここで分岐可能
  }
  res.status(200).json({ message: "Figma MCPサーバーが動作しています。" });
}
