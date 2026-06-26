"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    signIn("authentik", { callbackUrl: "/" });
  }, []);

  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: 14, color: "var(--fg-muted)" }}>Přesměrování na přihlášení…</p>
    </main>
  );
}
