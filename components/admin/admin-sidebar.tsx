"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ExternalLink,
  Bell,
  Inbox,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  Users,
  UserCog,
  Wallet,
  X,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    title: "Visão geral",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Notificações", href: "/admin/notificacoes", icon: Bell },
    ],
  },
  {
    title: "Comercial",
    items: [
      { label: "Leads", href: "/admin/leads", icon: Inbox },
      { label: "Clientes", href: "/admin/clientes", icon: Users },
      { label: "Pedidos", href: "/admin/pedidos", icon: Briefcase },
    ],
  },
  {
    title: "Finanças",
    items: [
      { label: "Facturas", href: "/admin/faturas", icon: Receipt },
      { label: "Financeiro", href: "/admin/financeiro", icon: Wallet },
    ],
  },
];

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  /** Gaveta aberta (só mobile) — o estado vive no AdminShell. */
  isOpen: boolean;
  onClose: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminSidebar({ userName, userEmail, isAdmin, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const setIsOpen = (value: boolean) => {
    if (!value) onClose();
  };

  const groups = isAdmin
    ? [
        ...NAV_GROUPS,
        {
          title: "Sistema",
          items: [{ label: "Utilizadores", href: "/admin/utilizadores", icon: UserCog }],
        },
      ]
    : NAV_GROUPS;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col bg-navy-900 text-white transition-transform duration-300 ease-in-out",
          "md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <Link href="/admin" onClick={() => setIsOpen(false)} aria-label="Dashboard">
            <Logo variant="light" className="h-8" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" strokeWidth={1.9} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Painel">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-xs font-semibold text-white/40">{group.title}</p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/65 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-1 rounded-r-full bg-accent-500" />
                      )}
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.8} />
            Ver o site
          </Link>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 px-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
              {initials(userName) || "A"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="flex items-center gap-1 truncate text-xs text-white/50">
                {isAdmin && <ShieldCheck className="h-3 w-3 shrink-0 text-accent-400" />}
                {userEmail}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
