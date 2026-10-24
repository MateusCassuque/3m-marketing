"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { NotificationBell } from "@/components/admin/notificacoes/notification-bell";
import { Logo } from "@/components/logo";

interface AdminShellProps {
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  children: React.ReactNode;
}

/** Estrutura do painel: menu lateral + barra de topo (com o sino de notificações) + conteúdo. */
export function AdminShell({ userName, userEmail, isAdmin, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F6FB] md:flex">
      <AdminSidebar
        userName={userName}
        userEmail={userEmail}
        isAdmin={isAdmin}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="min-w-0 flex-1">
        {/* Uma única barra: no mobile tem logótipo e menu; no computador só o sino, à direita. */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-navy-800 bg-navy-900 px-4 md:justify-end md:border-border md:bg-[#F3F6FB]/90 md:px-10 md:backdrop-blur">
          <Link href="/admin" className="md:hidden" aria-label="Dashboard">
            <Logo variant="light" className="h-7" />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.9} />
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
