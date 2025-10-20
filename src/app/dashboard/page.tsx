"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserInfo,
  DashboardContent,
} from "@/components/dashboard";
import {
  getStoredToken,
  decodeToken,
  isTokenExpired,
  DecodedToken,
  clearAuth,
} from "@/lib/auth.utils";
import MyTasksWidgetClient from "./components/MyTasksWidgetClient";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-950 min-h-screen min-w-screen p-8">
      <div className="max-w-full mx-auto">
        <UserInfo user={user} />
        <DashboardContent />
        <MyTasksWidgetClient />
      </div>
    </div>
  );
}
