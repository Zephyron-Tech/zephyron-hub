import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/serverAuth";

/**
 * GET /api/auth/microsoft/login
 * 
 * Initiates Microsoft OAuth flow for OneDrive access
 * Redirects user to Microsoft login page
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

    // Scopes needed for OneDrive access
    const scopes = [
      "Files.Read",
      "Files.Read.All",
      "offline_access", // For refresh token
    ].join(" ");

    // Build authorization URL
    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("response_mode", "query");
    authUrl.searchParams.append("state", userId.toString()); // Pass user ID in state

    // Redirect to Microsoft login
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Microsoft OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Microsoft login" },
      { status: 500 }
    );
  }
}
