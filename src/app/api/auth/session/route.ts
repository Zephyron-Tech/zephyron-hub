import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * GET /api/auth/session
 * 
 * Vrací aktuální session na základě JWT tokenu v Authorization headeru
 * Očekává header: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    // Získáme Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Missing or invalid Authorization header",
          details: 'Expected header format: "Authorization: Bearer <token>"',
        },
        { status: 401 }
      );
    }

    // Extrahujeme token z headeru
    const token = authHeader.substring(7); // Odstraníme "Bearer "

    // Ověříme a dekódujeme token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET as string);

    return NextResponse.json(
      {
        user: decoded,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session error:", error);

    // Pokud je token neplatný nebo vypršel
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          error: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        {
          error: "Token expired",
        },
        { status: 401 }
      );
    }

    // Obecná chyba
    return NextResponse.json(
      {
        error: "An error occurred while retrieving session",
      },
      { status: 500 }
    );
  }
}
