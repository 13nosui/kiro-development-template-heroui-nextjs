import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;
  const { fileId } = await params;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Figma access token not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
      headers: {
        "X-Figma-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ name: data.name });
  } catch (error) {
    console.error("Figma API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Figma file" },
      { status: 500 }
    );
  }
}
