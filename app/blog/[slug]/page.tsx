import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { CtaSection } from "@/components/sections/cta-section";
import { BLOG_POSTS, formatPostDate, getPostBySlug } from "@/app/blog/posts-data";

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Artigo não encontrado | 3M Agência de Marketing" };
  return {
    title: `${post.title} | Blog 3M`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} />

      <article className="bg-white py-16 lg:py-20">
        <div className="container-padded mx-auto max-w-2xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o blog
          </Link>

          <div className="mt-6 flex items-center gap-5 border-b border-border pb-6 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatPostDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          <div className="mt-8 space-y-5">
            {post.content.map((paragraph, index) => (
              <p key={index} className="text-balance leading-relaxed text-navy-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-muted/50 py-16 lg:py-20">
          <div className="container-padded">
            <h2 className="text-center font-display text-2xl font-extrabold text-navy-700">
              Continue lendo
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-600">
                    {related.category}
                  </span>
                  <h3 className="mt-3 text-balance font-display text-base font-bold text-navy-700">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />
    </>
  );
}
