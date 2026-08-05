"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

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
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 shadow-soft backdrop-blur-md"
          : "bg-white/70 backdrop-blur-sm",
      )}
    >
      <div className="container-padded flex h-20 items-center justify-between">
        <Link href="/" aria-label="3M — página inicial">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative pb-1 text-sm font-bold uppercase tracking-wide text-navy-500 transition-colors hover:text-primary-600",
                  isActive && "text-primary-600",
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-primary-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button variant="teal" size="default" onClick={openContact}>
            Vamos conversar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <button
          type="button"
          onClick={toggleMobileNav}
          className="rounded-full p-2 text-navy-700 hover:bg-navy-50 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={(open) => !open && closeMobileNav()}>
        <SheetContent>
          <Logo />
          <nav className="mt-4 flex flex-col gap-1" aria-label="Navegação móvel">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileNav}
                className="rounded-lg px-3 py-3 text-base font-bold text-navy-700 transition-colors hover:bg-primary-50 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button variant="accent" className="mt-auto w-full" onClick={openContact}>
            Vamos conversar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </SheetContent>
      </Sheet>
    </motion.header>
  );
}
