import type { Metadata, Viewport } from "next";

// O painel é uma app instalável à parte (abre direto em /admin e mostra o
// número de notificações por ler no ícone). Ver public/admin-manifest.json.
export const metadata: Metadata = {
  title: { default: "Painel Kodeza", template: "%s" },
  manifest: "/admin-manifest.json",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Painel Kodeza", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#04132E",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
