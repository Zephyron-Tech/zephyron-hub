import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * GET /api/auth/microsoft
 * 
 * Initiates OAuth flow with Microsoft to get access to user's OneDrive
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please login first" },
        { status: 401 }
      );
    }

    const clientId = process.env.AZURE_CLIENT_ID;
    const tenantId = process.env.AZURE_TENANT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`;

    if (!clientId || !tenantId) {
      return NextResponse.json(
        { error: "Microsoft OAuth not configured" },
        { status: 500 }
      );
    }

    // Build authorization URL
    // Use 'common' instead of tenant ID to allow any Microsoft account (including personal)
    const authUrl = new URL(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_mode", "query");
    authUrl.searchParams.set("scope", "Files.Read Files.Read.All offline_access");
    authUrl.searchParams.set("state", userId.toString()); // Pass userId in state to identify user after redirect

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Microsoft OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Microsoft OAuth" },
      { status: 500 }
    );
  }
}
