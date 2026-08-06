"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Briefcase,
  Receipt,
  Wallet,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Visão geral", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Pedidos", href: "/admin/pedidos", icon: Briefcase },
  { label: "Faturas", href: "/admin/faturas", icon: Receipt },
  { label: "Financeiro", href: "/admin/financeiro", icon: Wallet },
];

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
}

export function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão hamburguer — só aparece no mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white shadow-sm md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-navy-700" strokeWidth={1.9} />
      </button>

      {/* Overlay escuro atrás do drawer no mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-border bg-white transition-transform duration-300 ease-in-out",
          "md:static md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-6">
          <Logo />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700 md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" strokeWidth={1.9} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-navy-500 hover:bg-navy-50 hover:text-navy-700",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.9} />
            Ver site
          </Link>
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-bold text-navy-700">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}