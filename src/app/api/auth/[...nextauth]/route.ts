// Soubor: src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // Náš singleton PrismaClient
import bcrypt from "bcrypt";

// Rozšíření typů NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
  }
}

export const authOptions: AuthOptions = {
  // Definujeme poskytovatele autentizace, v našem případě jen přihlášení heslem
  providers: [
    CredentialsProvider({
      // Název, který se může zobrazit na přihlašovací stránce
      name: "Credentials",
      // ID pro interní použití
      id: "credentials",
      // Zde definujeme pole, která očekáváme od přihlašovacího formuláře
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Toto je srdce přihlašovací logiky
      async authorize(credentials) {
        // Zkontrolujeme, zda máme e-mail a heslo
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Najdeme uživatele v databázi podle e-mailu
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Pokud uživatel neexistuje, nebo pokud heslo nesouhlasí, vrátíme null
        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          // Můžete vrátit null nebo Error objekt
          return null;
        }

        // Pokud je vše v pořádku, vrátíme objekt uživatele (bez hesla!)
        // Tento objekt se pak uloží do JWT tokenu
        return {
          id: user.id.toString(), // ID musí být string
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  // Callbacky pro JWT a session
  callbacks: {
    async jwt({ token, user }) {
      // Když se uživatel poprvé přihlásí, přidáme jeho data do tokenu
      if (user) {
        token.id = user.id;
        token.email = user.email || null;
        token.name = user.name || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Přidáme data z tokenu do session objektu
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null | undefined;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },

  // Používáme JWT (JSON Web Tokens) pro správu session
  session: {
    strategy: "jwt",
  },

  // Tajný klíč pro podepisování tokenů. DŮLEŽITÉ!
  secret: process.env.NEXTAUTH_SECRET,

  // URL pro přesměrování
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

// Vytvoříme a exportujeme handlery pro GET a POST požadavky
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
