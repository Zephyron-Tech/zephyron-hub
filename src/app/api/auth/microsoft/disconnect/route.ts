import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * POST /api/auth/microsoft/disconnect
 * 
 * Disconnects Microsoft account by removing stored tokens
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clear Microsoft tokens from database
    await prisma.user.update({
      where: { id: userId },
      data: {
        microsoftAccessToken: null,
        microsoftRefreshToken: null,
        microsoftTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Microsoft disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Microsoft account" },
      { status: 500 }
    );
  }
}
