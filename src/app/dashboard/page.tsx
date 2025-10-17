"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignOutButton from "./SignOutButton";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Zkontrolujeme, jestli token vypršel
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("auth_token");
        router.push("/login");
        return;
      }

      setUser(decoded);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("auth_token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Načítání...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Vítejte v Zephyron Hub! 🚀</h1>
        <p className="text-gray-600 mb-8">
          Jste přihlášen jako: <strong>{user.name}</strong> (
          <span className="text-blue-600">{user.email}</span>)
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-gray-700">
            Vítejte na vašem privátním dashboardu. Tady budete mít přístup ke všem
            nástrojům a funkcím Zephyron Hub.
          </p>
        </div>

        <div className="flex gap-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
