"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
    >
      Odhlásit se
    </button>
  );
}
