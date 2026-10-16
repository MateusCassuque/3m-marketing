"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Menu } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/site-data";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isMobileNavOpen, closeMobileNav, toggleMobileNav, openContact } = useUIStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300",
        scrolled
          ? "border-white/10 bg-navy-900/90 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          : "border-transparent bg-navy-900/60 backdrop-blur-md",
      )}
    >
      <div className="container-padded flex h-[72px] items-center justify-between">
        <Link href="/" aria-label="Kodeza — página inicial" className="shrink-0">
          <Logo variant="light" priority className="h-9 sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white",
                  isActive && "text-white",
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-accent-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="accent" size="default" onClick={openContact}>
            Pedir proposta
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <button
          type="button"
          onClick={toggleMobileNav}
          className="rounded-full p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={(open) => !open && closeMobileNav()}>
        <SheetContent className="flex flex-col bg-navy-900 text-white">
          <DialogPrimitive.Title className="sr-only">Menu de navegação</DialogPrimitive.Title>
          <Logo variant="light" className="h-9" />
          <nav className="mt-4 flex flex-col gap-1" aria-label="Navegação móvel">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileNav}
                className="rounded-xl px-3 py-3 text-lg font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button variant="accent" className="mt-auto w-full" onClick={openContact}>
            Pedir proposta
            <ArrowRight className="h-4 w-4" />
          </Button>
        </SheetContent>
      </Sheet>
    </header>
  );
}
