import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/microsoft/callback
 * 
 * Handles the OAuth callback from Microsoft and exchanges code for tokens
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");

    if (error) {
      console.error("Microsoft OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=missing_code_or_state", request.url)
      );
    }

    const userId = parseInt(state);
    if (isNaN(userId)) {
      return NextResponse.redirect(
        new URL("/dashboard?error=invalid_state", request.url)
      );
    }

    const clientId = process.env.AZURE_CLIENT_ID;
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`;

    if (!clientId || !tenantId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/dashboard?error=oauth_not_configured", request.url)
      );
    }

    // Exchange code for tokens
    // Use 'common' to support any Microsoft account type
    const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Store tokens in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        microsoftAccessToken: tokens.access_token,
        microsoftRefreshToken: tokens.refresh_token,
        microsoftTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL("/dashboard?microsoft_connected=true", request.url)
    );
  } catch (error) {
    console.error("Microsoft OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_callback_failed", request.url)
    );
  }
}
