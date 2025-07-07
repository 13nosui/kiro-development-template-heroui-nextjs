import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const data = {
    service: "test-ai-service",
    status: "active",
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const result = {
    service: "test-ai-service",
    received: body,
    processed: true,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(result);
}