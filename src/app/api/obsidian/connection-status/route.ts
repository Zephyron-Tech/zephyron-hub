import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * GET /api/obsidian/connection-status
 * 
 * Checks if user has connected their Microsoft account
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        microsoftAccessToken: true,
        microsoftRefreshToken: true,
        microsoftTokenExpiry: true,
      },
    });

    const connected = !!(
      user?.microsoftRefreshToken &&
      user?.microsoftAccessToken
    );

    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Connection status check error:", error);
    return NextResponse.json(
      { error: "Failed to check connection status" },
      { status: 500 }
    );
  }
}
