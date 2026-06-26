import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const devMiddleware = (_req: NextRequest) => NextResponse.next();

const prodMiddleware = withAuth({
  pages: { signIn: "/login" },
});

export default process.env.NODE_ENV === "development" ? devMiddleware : prodMiddleware;

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
