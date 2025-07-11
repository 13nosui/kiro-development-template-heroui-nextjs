import axios from 'axios';
import { envUtils } from '../src/lib/env';

// Node.js環境の型定義
declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

// 環境変数の安全な取得
function getEnvVar(key: string): string | null {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : null;
}

function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (value === null) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

const createWebhook = async () => {
  try {
    // 必須環境変数の取得
    const FIGMA_WEBHOOK_SECRET = getRequiredEnvVar('FIGMA_WEBHOOK_SECRET');
    
    // Figma Personal Access Token の取得（複数の候補から選択）
    const figmaAccessToken = getEnvVar('FIGMA_ACCESS_TOKEN');
    const figmaPersonalToken = getEnvVar('FIGMA_PERSONAL_ACCESS_TOKEN');
    const FIGMA_PERSONAL_ACCESS_TOKEN = figmaAccessToken || figmaPersonalToken;
    
    if (!FIGMA_PERSONAL_ACCESS_TOKEN) {
      throw new Error(
        'Figma access token is required. Please set FIGMA_ACCESS_TOKEN or FIGMA_PERSONAL_ACCESS_TOKEN environment variable.\n' +
        'Available tokens: FIGMA_ACCESS_TOKEN=' + (figmaAccessToken ? 'set' : 'not set') + ', ' +
        'FIGMA_PERSONAL_ACCESS_TOKEN=' + (figmaPersonalToken ? 'set' : 'not set')
      );
    }
    
    const ENDPOINT = 'https://dfd04100716e96.lhr.life/api/figma-mcp'; // ngrok等で外部公開したURLに変更
    
    const response = await axios.post('https://api.figma.com/v2/webhooks', {
      event_type: 'FILE_UPDATE',
      team_id: '675153021529604871',
      endpoint: ENDPOINT,
      passcode: FIGMA_WEBHOOK_SECRET,
      status: 'ACTIVE'
    }, {
      headers: {
        'X-Figma-Token': FIGMA_PERSONAL_ACCESS_TOKEN
      }
    });
    
    console.log('✅ Webhook created successfully:', response.data);
  } catch (error: any) {
    // 本番環境ではconsole.errorを無効化
    if (!envUtils.isProduction()) {
      console.error('❌ Error creating webhook:', error.response?.data || error.message);
    }
    process.exit(1);
  }
};

createWebhook();
