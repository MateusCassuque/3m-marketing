import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactDialog } from "@/components/contact-dialog";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <ContactDialog />
    </>
  );
}
