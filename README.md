# Project Template

このリポジトリは Figma Dev Mode MCP サーバーと Copilot の提供でお送りします。

## Figma Dev Mode MCP サーバー連携手順

1. `.env.local` に Figma の Webhook Secret と Personal Access Token を設定してください。

   - `FIGMA_WEBHOOK_SECRET` : Figma Webhook 作成時に発行されるシークレット
   - `FIGMA_PERSONAL_ACCESS_TOKEN` : Figma の個人アクセストークン（必要に応じて）

2. Figma の[Dev Mode](https://www.figma.com/developers/api#webhooks)で Webhook を作成し、エンドポイント URL に `https://<your-domain>/api/figma-mcp` を指定してください。

   - 署名検証のため、Webhook 作成時のシークレットを`.env.local`に設定してください。

3. サーバー起動

   ```sh
   npm run dev
   ```

4. Figma からのイベント（例: FILE_UPDATE）が API で受信できるようになります。

---

Figma MCP サーバーの API エンドポイントは `src/pages/api/figma-mcp.ts` です。
署名検証やイベントごとの処理はこのファイルで拡張してください。
