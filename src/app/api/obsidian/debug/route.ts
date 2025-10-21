import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/obsidian/debug
 * 
 * Debug endpoint to explore OneDrive structure
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
      },
    });

    if (!user || !user.microsoftAccessToken) {
      return NextResponse.json(
        { error: "Microsoft account not connected" },
        { status: 401 }
      );
    }

    const accessToken = user.microsoftAccessToken;

    // Get drive info
    const driveResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/drive",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    let driveInfo = null;
    if (driveResponse.ok) {
      driveInfo = await driveResponse.json();
    } else {
      driveInfo = {
        error: driveResponse.status,
        errorText: await driveResponse.text(),
      };
    }

    // List root items
    const rootResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/drive/root/children",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    let rootItems = null;
    if (rootResponse.ok) {
      rootItems = await rootResponse.json();
    } else {
      rootItems = {
        error: rootResponse.status,
        errorText: await rootResponse.text(),
      };
    }

    // Try to list items with the path
    const vaultPath = process.env.ONEDRIVE_VAULT_PATH;
    let vaultItems = null;
    
    if (vaultPath) {
      const vaultResponse = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/root:/${vaultPath}:/children`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );
      
      if (vaultResponse.ok) {
        vaultItems = await vaultResponse.json();
      } else {
        vaultItems = {
          error: vaultResponse.status,
          errorText: await vaultResponse.text(),
        };
      }
    }

    return NextResponse.json({
      driveInfo,
      rootItems,
      vaultPath,
      vaultItems,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: String(error) },
      { status: 500 }
    );
  }
}
