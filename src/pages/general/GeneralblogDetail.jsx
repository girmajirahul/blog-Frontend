import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, Tag } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GeneralBlog() {
  const [page,setPage]=useState(1);
  const [limit,setLimit]=useState(5);

  const { slug } = useParams();
  

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE}/api/blogs/slug/${slug}`
      );

      setData(response.data.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);


  const post=data


  React.useEffect(() => {
    if (post) {
      document.title = `${post.title} — Journal`;
      document.querySelector('meta[name="description"]')?.setAttribute(
        "content",
        post.excerpt
      );
    }
  }, [post]);

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
        {loading ? (
          <div className="text-center">
            <p
              className="text-4xl text-gradient"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Loading please wait
            </p>

          </div>

        ) : (
          <div className="text-center">
            <p
              className="text-4xl text-gradient"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Essay not found
            </p>
            <Link to="/" className="mt-4 inline-block text-sm text-accent underline">
              Back to the Journal
            </Link>
          </div>
        )}

      </div>
    );
  }

  

  return (
    <div className="relative min-h-screen bg-background text-foreground">
     

      {/* Ambient background */}
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
            The Journal
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
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 space-y-7 text-[1.0625rem] md:text-lg leading-[1.9] text-foreground/90"
            style={{ fontFamily: '"Fira Sans", sans-serif' }}
          >
            {post.content.map((para, i) => (
              <p key={i}>
                {i === 0 ? (
                  <>
                    <span
                      className="float-left mr-3 text-6xl leading-none text-gradient"
                      style={{ fontFamily: '"DM Serif Display", serif' }}
                    >
                      {para.charAt(0)}
                    </span>
                    {para.slice(1)}
                  </>
                ) : (
                  para
                )}
              </p>
            ))}
          </motion.div>

          <div className="mt-14 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full glass px-3 py-1 text-xs uppercase tracking-wider text-foreground/80"
              >
                {t}
              </span>
            ))}
          </div>

         
        </article>
      </main>
    </div>
  );
}
