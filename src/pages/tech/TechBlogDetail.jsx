import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  Code2,
  Info,
  AlertTriangle,
  Tag,
} from "lucide-react";

import CodeBlock from "./CodeBlock";
import React, { useEffect, useState } from "react";
import axios from "axios";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TechBlogDetail() {
  const { slug } = useParams();
   const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTech = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_API_BASE}/api/tech/slug/${slug}`);

      setData(response.data.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchTech();
    }
  }, [slug]);
  const post = data


  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // optional, use "auto" for instant
    });
  }, [slug]);


  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        {loading ? (<div className="text-center">
          <p
            className="text-4xl text-gradient"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Loading please wait
          </p>


        </div>) : (
          <div className="text-center">
            <p
              className="text-4xl text-gradient"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Post not found
            </p>

            <Link
              to="/tech"
              className="mt-4 inline-block text-sm text-accent underline"
            >
              Back to Tech Notes
            </Link>
          </div>)}

      </div>
    );
  }

  
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-20" />

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        
      />

      <main className="container mx-auto px-6 pt-32 pb-24">
        <article className="mx-auto max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tech Notes
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10"
          >
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.date)}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>

              <span className="inline-flex items-center gap-1.5 text-accent">
                <Code2 className="h-3.5 w-3.5" />
                {post.stack.join(" · ")}
              </span>
            </div>

            <h1
              className="mt-5 text-4xl md:text-6xl leading-[1.05]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              {post.title}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          </motion.header>

          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 text-[1.0625rem] md:text-lg leading-[1.85] text-foreground/90"
            style={{ fontFamily: '"Fira Sans", sans-serif' }}
          >
            {post.content.map((block, i) => {
              switch (block.type) {
                case "p":
                  return (
                    <p key={i} className="mb-6">
                      {block.text}
                    </p>
                  );

                case "h2":
                  return (
                    <h2
                      key={i}
                      className="mt-12 mb-5 text-2xl md:text-3xl text-foreground"
                      style={{ fontFamily: '"DM Serif Display", serif' }}
                    >
                      {block.text}
                    </h2>
                  );

                case "list":
                  return (
                    <ul
                      key={i}
                      className="mb-6 list-disc pl-6 space-y-2 marker:text-accent"
                    >
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );

                case "code":
                  return (
                    <CodeBlock
                      key={i}
                      code={block.code}
                      language={block.language}
                      filename={block.filename}
                    />
                  );

                case "callout": {
                  const warn = block.tone === "warn";

                  return (
                    <div
                      key={i}
                      className={`my-6 flex gap-3 rounded-xl border p-4 text-base ${warn
                        ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-100/90"
                        : "border-accent/30 bg-accent/5 text-foreground/90"
                        }`}
                    >
                      {warn ? (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                      ) : (
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      )}

                      <p>{block.text}</p>
                    </div>
                  );
                }

                default:
                  return null;
              }
            })}
          </motion.div>

          <div className="mt-14 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />

            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full glass px-3 py-1 text-xs uppercase tracking-wider text-foreground/80"
              >
                {tag}
              </span>
            ))}
          </div>

        </article>
      </main>
    </div>
  );
}