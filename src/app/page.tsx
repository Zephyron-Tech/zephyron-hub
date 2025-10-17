// Soubor: src/app/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function HomePage() {
  // Na serveru zkontrolujeme, jestli existuje session
  const session = await getServerSession(authOptions);

  // Podle toho, jestli je uživatel přihlášen, ho přesměrujeme
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  // Tato komponenta nikdy nic nevykreslí, protože vždy dojde k přesměrování
  return null;
}