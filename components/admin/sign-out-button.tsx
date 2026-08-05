"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
