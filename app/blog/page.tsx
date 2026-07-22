import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { BlogList } from "@/components/sections/blog-list";
import { CtaSection } from "@/components/sections/cta-section";
import { BLOG_POSTS } from "@/app/blog/posts-data";

export const metadata: Metadata = {
  title: "Blog | 3M Agência de Marketing",
  description:
    "Artigos sobre estratégia, tráfego pago, mídias sociais e branding — direto da experiência de quem executa campanhas todos os dias.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights sobre marketing que geram resultado"
        description="Conteúdo direto ao ponto, escrito por quem está na operação — sem fórmula pronta, sem enrolação."
      />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded">
          <BlogList posts={BLOG_POSTS} />
        </div>
      </section>

      <CtaSection />
    </>
  );
}
