#!/usr/bin/env node

/**
 * HeroUI全自動サービス開発スクリプト
 * 使用方法: node scripts/create-service.js [service-name]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICE_NAME = process.argv[2] || 'my-service';
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'app', SERVICE_NAME);
const API_DIR = path.join(process.cwd(), 'src', 'app', 'api', SERVICE_NAME);

console.log(`🚀 Creating service: ${SERVICE_NAME}`);

// ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created: ${OUTPUT_DIR}`);
}

if (!fs.existsSync(API_DIR)) {
  fs.mkdirSync(API_DIR, { recursive: true });
  console.log(`📁 Created: ${API_DIR}`);
}

// ページファイル作成
const pageContent = `import { HeroUIShowcase } from "@/components/HeroUIShowcase";
import { ServiceDashboard } from "@/components/ServiceDashboard";

export default function ${SERVICE_NAME.charAt(0).toUpperCase() + SERVICE_NAME.slice(1)}Page() {
  return (
    <main className="min-h-screen bg-nidomi-surface">
      <div className="container mx-auto p-6">
        <h1 className="text-large font-bold text-nidomi-primary mb-6">
          ${SERVICE_NAME.charAt(0).toUpperCase() + SERVICE_NAME.slice(1)} Service
        </h1>
        <ServiceDashboard serviceName="${SERVICE_NAME}" />
        <HeroUIShowcase />
      </div>
    </main>
  );
}`;

// API Routeファイル作成
const apiContent = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const data = {
    service: "${SERVICE_NAME}",
    status: "active",
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const result = {
    service: "${SERVICE_NAME}",
    received: body,
    processed: true,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(result);
}`;

// ファイル書き込み
fs.writeFileSync(path.join(OUTPUT_DIR, 'page.tsx'), pageContent);
fs.writeFileSync(path.join(API_DIR, 'route.ts'), apiContent);

console.log(`📄 Created: ${OUTPUT_DIR}/page.tsx`);
console.log(`📄 Created: ${API_DIR}/route.ts`);
console.log(`✅ Service '${SERVICE_NAME}' created successfully!`);
console.log(`\n📖 Access your service at: http://localhost:3000/${SERVICE_NAME}`);
console.log(`📖 API endpoint: http://localhost:3000/api/${SERVICE_NAME}`);
