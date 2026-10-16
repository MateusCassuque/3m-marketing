import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { FeaturedWork } from "@/components/sections/featured-work";
import { HomePricing } from "@/components/sections/home-pricing";
import { SocialBand } from "@/components/sections/social-band";
import { ProcessSteps } from "@/components/sections/process-steps";
import { WhyUs } from "@/components/sections/why-us";
import { StatsBand } from "@/components/sections/stats-band";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedWork />
      <HomePricing />
      <SocialBand />
      <section className="bg-white py-20 lg:py-28">
        <ProcessSteps />
      </section>
      <WhyUs />
      <StatsBand />
      <CtaSection />
    </>
  );
}
