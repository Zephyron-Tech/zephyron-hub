"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  if (process.env.NODE_ENV === "development") return null;

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Odhlásit se"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: "var(--fg-subtle)",
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid transparent",
        transition: "color 150ms var(--ease-out), border-color 150ms var(--ease-out), background 150ms var(--ease-out)",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.color = "var(--fg)";
        el.style.borderColor = "var(--border)";
        el.style.background = "var(--surface)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.color = "var(--fg-subtle)";
        el.style.borderColor = "transparent";
        el.style.background = "transparent";
      }}
    >
      <LogOut size={15} strokeWidth={1.5} />
      Odhlásit
    </button>
  );
}
