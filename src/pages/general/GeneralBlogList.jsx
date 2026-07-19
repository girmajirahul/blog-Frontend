import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { genApi } from "../../api/index";
import { formatDate, truncate } from "../../utils/helpers";
import Button from "../../components/Button";
import DeleteModal from "../../components/DeleteModal";
import PageWrapper from "../../components/PageWrapper";

const MOCK = [
  { _id: "g1", title: "My Developer Journey — 3 Years Later", slug: "developer-journey-3-years", excerpt: "Reflecting on what I have learned, what I wish I knew, and where I am headed.", date: "Jan 8, 2025", tags: ["career", "personal"], readingTime: "5 min read", coverImage: "", content: ["Para 1", "Para 2"] },
  { _id: "g2", title: "Remote Work Tips That Actually Work", slug: "remote-work-tips", excerpt: "Practical habits that helped me stay productive working from home.", date: "Jan 2, 2025", tags: ["productivity", "remote"], readingTime: "4 min read", coverImage: "", content: ["Para 1"] },
  { _id: "g3", title: "Why I Switched From VS Code to Neovim", slug: "vscode-to-neovim", excerpt: "An honest take after 6 months of using Neovim as my daily driver.", date: "Dec 15, 2024", tags: ["tools", "editors"], readingTime: "6 min read", coverImage: "", content: ["Para 1", "Para 2", "Para 3"] },
];

export default function GeneralBlogList({ onToast }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
    genApi.getAll(page,limit)
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
      await genApi.delete(delTarget._id);
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
      r = r.filter(b => b.title?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q) || b.tags?.some(t => t.toLowerCase().includes(q)));
    }
    r.sort((a, b) => sort === "newest" ? new Date(b.createdAt ?? b.date ?? 0) - new Date(a.createdAt ?? a.date ?? 0) : sort === "oldest" ? new Date(a.createdAt ?? a.date ?? 0) - new Date(b.createdAt ?? b.date ?? 0) : (a.title ?? "").localeCompare(b.title ?? ""));
    return r;
  }, [blogs, search, sort]);

  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24 md:pb-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-gen" />
              <span className="text-xs font-bold text-gen-dark uppercase tracking-widest">General Blogs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">All General Blogs</h1>
            <p className="text-sm text-ink-secondary mt-0.5">{loading ? "Loading…" : `${blogs.length} posts`}</p>
          </div>
          <Link to="/admin/general/create">
            <Button variant="sky" icon={<PlusIcon />}>New Post</Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or tag…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border hover:border-border-strong rounded-lg focus:outline-none focus:border-gen focus:ring-2 focus:ring-gen/20 transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"><XIcon /></button>}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-white border border-border text-sm text-ink rounded-lg px-3 py-2 focus:outline-none focus:border-gen transition-all cursor-pointer">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A→Z</option>
          </select>
        </div>

        {/* Content */}
        {loading ? <Skeletons /> : filtered.length === 0 ? <Empty search={search} onClear={() => setSearch("")} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-1 gap-4">
            <AnimatePresence>
              {filtered.map((blog, i) => (
                <motion.div key={blog._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }} whileHover={{ y: -2 }}
                  className="bg-white border border-border rounded-xl shadow-card hover:border-gen-border hover:shadow-[0_4px_16px_rgba(14,165,233,0.1)] transition-all flex flex-col overflow-hidden group"
                >
                  {/* Cover */}
                  {blog.coverImage ? (
                    <div className="h-32 overflow-hidden">
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-gen to-gen-dark" />
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {blog.tags?.slice(0, 3).map(t => <span key={t} className="tag-gen">{t}</span>)}
                    </div>

                    {/* Title */}
                    <h2 className="font-semibold text-ink group-hover:text-gen-dark transition-colors text-sm leading-snug mb-1.5 line-clamp-2">{blog.title}</h2>
                    <p className="text-xs text-ink-secondary leading-relaxed flex-1 line-clamp-3">{blog.excerpt}</p>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-ink-muted">{blog.date || formatDate(blog.createdAt)}</p>
                          <p className="text-[10px] text-ink-faint mt-0.5">{blog.readingTime} · {blog.content?.length ?? 0} paragraphs</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link to={`/admin/general/edit/${blog._id}`}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gen-light text-gen-dark border border-gen-border hover:bg-gen hover:text-white hover:border-gen transition-all">
                              Edit
                            </motion.button>
                          </Link>
                            <Link to={`/general/view/${blog.slug}`}>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gen-light text-gen-dark border border-gen-border hover:bg-gen hover:text-white hover:border-gen transition-all">
                                View
                              </motion.button>
                            </Link>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setDelTarget(blog)}
                            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-danger-light text-danger border border-danger-border hover:bg-danger hover:text-white hover:border-danger transition-all">
                            Delete
                          </motion.button>
                        </div>
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
        <div className="mt-1 mb-10 flex flex-col sm:flex-row items-center justify-evenly gap-2">

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

function Skeletons() {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-white border border-border rounded-xl animate-pulse" />)}</div>;
}
function Empty({ search, onClear }) {
  return (
    <div className="flex flex-col items-center py-16 text-center bg-white border border-border rounded-xl">
      <div className="w-12 h-12 rounded-xl bg-gen-light border border-gen-border flex items-center justify-center mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gen"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
      </div>
      <h3 className="font-semibold text-ink mb-1">{search ? `No results for "${search}"` : "No general blogs yet"}</h3>
      <p className="text-sm text-ink-secondary mb-4">{search ? "Try a different search." : "Write your first general blog post."}</p>
      {search ? <Button variant="secondary" size="sm" onClick={onClear}>Clear search</Button>
        : <Link to="/admin/general/create"><Button variant="sky" size="sm">Create first post</Button></Link>}
    </div>
  );
}

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>;
const SearchIcon = ({ className }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>;
const XIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>;
