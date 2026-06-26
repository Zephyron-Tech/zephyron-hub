import NextAuth from "next-auth";
import AuthentikProvider from "next-auth/providers/authentik";

const isDev = process.env.NODE_ENV === "development";

const handler = NextAuth({
  providers: isDev
    ? []
    : [
        AuthentikProvider({
          clientId: process.env.AUTHENTIK_ID!,
          clientSecret: process.env.AUTHENTIK_SECRET!,
          issuer: process.env.AUTHENTIK_ISSUER,
        }),
      ],
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
