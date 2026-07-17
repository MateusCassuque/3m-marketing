import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { StatsBand } from "@/components/sections/stats-band";
import { CtaSection } from "@/components/sections/cta-section";
import { SiteFooter } from "@/components/site-footer";
import { ContactDialog } from "@/components/contact-dialog";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <StatsBand />
        <CtaSection />
      </main>
      <SiteFooter />
      <ContactDialog />
    </>
  );
}
