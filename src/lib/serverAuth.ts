import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Verifies JWT token from the Authorization header
 * Returns the decoded payload if valid, null otherwise
 */
export async function verifyAuthToken(
  request: NextRequest
): Promise<JwtPayload | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET!
    ) as JwtPayload;
    
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Gets the user ID from the request or returns null if not authenticated
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<number | null> {
  const payload = await verifyAuthToken(request);
  
  if (!payload) {
    return null;
  }
  
  return parseInt(payload.id);
}
