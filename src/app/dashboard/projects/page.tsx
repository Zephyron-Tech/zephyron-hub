"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredToken,
  decodeToken,
  isTokenExpired,
  DecodedToken,
  clearAuth,
} from "@/lib/auth.utils";
import { UserInfo, DashboardNav } from "@/components/dashboard";
import ProjectList from "./components/ProjectList";

export default function ProjectsPage() {
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
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-950 min-h-screen min-w-screen p-8">
      <div className="max-w-7xl mx-auto">
        <UserInfo user={user} />
        <DashboardNav />
        <ProjectList />
      </div>
    </div>
  );
}
