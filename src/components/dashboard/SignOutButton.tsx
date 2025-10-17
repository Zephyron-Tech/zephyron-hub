"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { clearAuth } from "@/lib/auth.utils";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <Button variant="danger" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};
