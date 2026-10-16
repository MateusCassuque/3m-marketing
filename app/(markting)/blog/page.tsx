import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { BlogList } from "@/components/sections/blog-list";
import { CtaSection } from "@/components/sections/cta-section";
import { BLOG_POSTS } from "@/app/(markting)/blog/posts-data";

export const metadata: Metadata = {
  title: "Blog | Kodeza · 3M",
  description:
    "Artigos sobre estratégia, tráfego pago, redes sociais e branding, escritos pela equipa da 3M.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideias de marketing para fazer o seu negócio crescer"
        description="Conteúdo directo ao ponto, escrito por quem está na operação todos os dias."
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
