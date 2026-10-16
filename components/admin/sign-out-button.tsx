"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="mt-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-red-500/15 hover:text-red-300"
    >
      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
      Terminar sessão
    </button>
  );
}
