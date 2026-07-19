import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { techApi } from "../../api/index";
import { formatDate, truncate } from "../../utils/helpers";
import Button from "../../components/Button";
import DeleteModal from "../../components/DeleteModal";
import PageWrapper from "../../components/PageWrapper";

const MOCK = [
  { _id: "t1", title: "Building a REST API with Express & MongoDB", slug: "rest-api-express", excerpt: "Step-by-step guide to building production-ready APIs", date: "Jan 10, 2025", tags: ["node", "express", "mongodb"], difficulty: "Intermediate", stack: ["Node.js", "Express", "MongoDB"], readingTime: "8 min read", featured: false, content: [{ type: "paragraph" }, { type: "code" }] },
  { _id: "t2", title: "React 19 Concurrent Features Deep Dive", slug: "react-19-concurrent", excerpt: "Understanding Suspense, transitions and concurrent rendering", date: "Jan 5, 2025", tags: ["react", "javascript"], difficulty: "Advanced", stack: ["React"], readingTime: "12 min read", featured: true, content: [{ type: "heading" }, { type: "paragraph" }, { type: "code" }] },
  { _id: "t3", title: "Docker for Node.js Developers", slug: "docker-nodejs", excerpt: "Containerise your Node apps like a pro", date: "Dec 20, 2024", tags: ["docker", "node"], difficulty: "Beginner", stack: ["Docker", "Node.js"], readingTime: "6 min read", featured: false, content: [{ type: "paragraph" }] },
];

export default function TechBlogList({ onToast }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [sort, setSort] = useState("newest");
  const [delTarget, setDelTarget] = useState(null);
  const [delLoad, setDelLoad] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);

  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  useEffect(() => {
    techApi.getAll(page, limit)
      .then((r) => {
        const d = r.data.data;

        setBlogs(d.data);
        setTotalPages(d.totalPages);
        setTotalBlogs(d.totalBlogs);
        setHasNextPage(d.hasNextPage);
        setHasPreviousPage(d.hasPreviousPage);
      })
      .catch(() => { setBlogs(MOCK); onToast?.("Using demo data.", "info"); })
      .finally(() => setLoading(false));
  }, [page, limit]);

  async function confirmDelete() {
    setDelLoad(true);
    try {
      await techApi.delete(delTarget._id);
      setBlogs(p => p.filter(b => b._id !== delTarget._id));
      onToast?.("Post deleted.", "success");
    } catch {
      setBlogs(p => p.filter(b => b._id !== delTarget._id));
      onToast?.("Post removed.", "success");
    } finally { setDelLoad(false); setDelTarget(null); }
  }

  const filtered = useMemo(() => {
    let r = [...blogs];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(b => b.title?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q) || b.tags?.some(t => t.toLowerCase().includes(q)) || b.stack?.some(t => t.toLowerCase().includes(q)));
    }
    if (diff !== "all") r = r.filter(b => b.difficulty === diff);
    r.sort((a, b) => sort === "newest" ? new Date(b.createdAt ?? b.date ?? 0) - new Date(a.createdAt ?? a.date ?? 0) : sort === "oldest" ? new Date(a.createdAt ?? a.date ?? 0) - new Date(b.createdAt ?? b.date ?? 0) : (a.title ?? "").localeCompare(b.title ?? ""));
    return r;
  }, [blogs, search, diff, sort]);

  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24 md:pb-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-tech" />
              <span className="text-xs font-bold text-tech uppercase tracking-widest">Tech Blogs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">All Tech Blogs</h1>
            <p className="text-sm text-ink-secondary mt-0.5">{loading ? "Loading…" : `${blogs.length} posts · ${blogs.filter(b => b.featured).length} featured`}</p>
          </div>
          <Link to="/admin/tech/create">
            <Button variant="primary" icon={<PlusIcon />}>New Post</Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, tag, stack…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border hover:border-border-strong rounded-lg focus:outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"><XIcon /></button>}
          </div>
          <select value={diff} onChange={e => setDiff(e.target.value)}
            className="bg-white border border-border text-sm text-ink rounded-lg px-3 py-2 focus:outline-none focus:border-tech transition-all cursor-pointer">
            <option value="all">All Levels</option>
            {["Beginner", "Intermediate", "Advanced"].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-white border border-border text-sm text-ink rounded-lg px-3 py-2 focus:outline-none focus:border-tech transition-all cursor-pointer">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A→Z</option>
          </select>
        </div>

        {/* Content */}
        {loading ? <Skeletons /> : filtered.length === 0 ? <Empty search={search} onClear={() => setSearch("")} /> : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((blog, i) => (
                <motion.div key={blog._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white border border-border rounded-xl shadow-card hover:border-tech-border hover:shadow-[0_2px_12px_rgba(99,102,241,0.08)] transition-all group"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={blog.difficulty === "Beginner" ? "badge-beginner" : blog.difficulty === "Advanced" ? "badge-advanced" : "badge-intermediate"}>
                            {blog.difficulty}
                          </span>
                          {blog.featured && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">⭐ Featured</span>}
                          <span className="text-xs text-ink-muted ml-auto">{blog.readingTime}</span>
                        </div>
                        {/* Title */}
                        <h2 className="font-semibold text-ink group-hover:text-tech transition-colors text-sm sm:text-base leading-snug cursor-pointer"
                          onClick={()=>navigate(`/techblog/${blog.slug}`)}
                        >
                          {blog.title}</h2>
                        <p className="text-sm text-ink-secondary mt-1 leading-relaxed">{truncate(blog.excerpt, 110)}</p>

                        {/* Tags + Stack */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {blog.tags?.map(t => <span key={t} className="tag-tech">{t}</span>)}
                          {blog.stack?.map(t => <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-muted text-ink-secondary border border-border">{t}</span>)}
                        </div>

                        {/* Footer meta */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-ink-muted">
                          <span>/{blog.slug}</span>
                          <span>·</span>
                          <span>{blog.date || formatDate(blog.createdAt)}</span>
                         
                         
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-1.5 flex-shrink-0">
                        <Link to={`/techblog/${blog.slug}`}>
                          <ActionBtn color="tech">View</ActionBtn>
                        </Link>
                        <Link to={`/admin/tech/edit/${blog._id}`}>
                          <ActionBtn color="tech">Edit</ActionBtn>
                        </Link>
                        <ActionBtn color="danger" onClick={() => setDelTarget(blog)}>Delete</ActionBtn>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {/* Pagination */}

      {!loading && totalPages > 1 && (
        <div className="m-8 flex flex-col sm:flex-row items-center justify-evenly gap-2">

          {/* Blog count */}

          <p className="text-sm text-ink-secondary">
            Showing page <span className="font-semibold text-tech">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
            {" "}({totalBlogs} blogs)
          </p>

          <div className="flex items-center gap-2">

            {/* Previous */}

            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPreviousPage}
              className={`px-4 py-2 rounded-xl border transition-all duration-200
              ${hasPreviousPage
                  ? "bg-white border-border hover:border-tech hover:text-tech hover:shadow-card"
                  : "bg-surface-muted border-border text-ink-muted cursor-not-allowed"
                }`}
            >
              ← Previous
            </button>

            {/* Numbers */}

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`w-10 h-10 rounded-xl border text-sm font-semibold transition-all duration-200
                ${page === index + 1
                    ? "bg-tech text-white border-tech shadow-card"
                    : "bg-white border-border hover:border-tech hover:text-tech"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next */}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-xl border transition-all duration-200
                ${hasNextPage
                  ? "bg-white border-border hover:border-tech hover:text-tech hover:shadow-card"
                  : "bg-surface-muted border-border text-ink-muted cursor-not-allowed"
                }`}
            >
              Next →
            </button>

          </div>

        </div>
      )}
      <DeleteModal isOpen={Boolean(delTarget)} title={delTarget?.title} onConfirm={confirmDelete} onCancel={() => setDelTarget(null)} loading={delLoad} />
    </PageWrapper>
  );
}

function ActionBtn({ children, color, onClick }) {
  const cls = color === "tech"
    ? "text-tech-dark bg-tech-light border-tech-border hover:bg-tech hover:text-white hover:border-tech"
    : "text-danger bg-danger-light border-danger-border hover:bg-danger hover:text-white hover:border-danger";
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${cls}`}>
      {children}
    </motion.button>
  );
}

function Skeletons() { return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white border border-border rounded-xl animate-pulse" />)}</div>; }
function Empty({ search, onClear }) {
  return (
    <div className="flex flex-col items-center py-16 text-center bg-white border border-border rounded-xl">
      <div className="w-12 h-12 rounded-xl bg-tech-light border border-tech-border flex items-center justify-center mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-tech"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
      </div>
      <h3 className="font-semibold text-ink mb-1">{search ? `No results for "${search}"` : "No tech blogs yet"}</h3>
      <p className="text-sm text-ink-secondary mb-4">{search ? "Try a different search term." : "Create your first tech blog post."}</p>
      {search ? <Button variant="secondary" size="sm" onClick={onClear}>Clear search</Button>
        : <Link to="/admin/tech/create"><Button size="sm">Create first post</Button></Link>}
    </div>
  );
}

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>;
const SearchIcon = ({ className }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>;
const XIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>;
