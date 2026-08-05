"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock } from "lucide-react";

import type { BlogPost } from "@/app/(markting)/blog/posts-data";
import { formatPostDate } from "@/app/(markting)/blog/posts-data";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [featured, ...rest] = posts;

  return (
    <div>
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-white shadow-soft lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-brand-gradient lg:aspect-auto">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.2),transparent_55%)]" />
              <span className="absolute left-6 top-6 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                {featured.category}
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatPostDate(featured.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readTime}
                </span>
              </div>
              <h2 className="mt-4 text-balance font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-balance leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600">
                Ler artigo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-600">
                {post.category}
              </span>
              <h3 className="mt-4 text-balance font-display text-lg font-bold text-navy-700">
                {post.title}
              </h3>
              <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{formatPostDate(post.date)}</span>
                <span className="inline-flex items-center gap-1 font-bold text-primary-600">
                  Ler
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
