"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserInfo, DashboardContent, SignOutButton } from "@/components/dashboard";
import { getStoredToken, decodeToken, isTokenExpired, DecodedToken, clearAuth } from "@/lib/auth.utils";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded || isTokenExpired(decoded)) {
      clearAuth();
      router.push("/login");
      return;
    }

    setUser(decoded);
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <UserInfo user={user} />
        <DashboardContent />
        <div className="flex gap-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
