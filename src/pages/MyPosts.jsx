import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";
import { techApi, genApi } from "../api";
import { jwtDecode } from "jwt-decode";
/* ── Mock data fallback ── */
const MOCK_TECH = [
    { _id: "t1", title: "Building REST APIs with Node.js", slug: "rest-api-nodejs", excerpt: "A complete guide to building scalable APIs", date: "Jan 15, 2025", tags: ["node", "api"], difficulty: "Intermediate", readingTime: "8 min read", content: [{ type: "paragraph" }, { type: "code" }] },
    { _id: "t2", title: "React 19 Concurrent Features", slug: "react-19", excerpt: "Deep dive into the latest React features", date: "Jan 10, 2025", tags: ["react"], difficulty: "Advanced", readingTime: "12 min read", content: [{ type: "paragraph" }] },
];
const MOCK_GEN = [
    { _id: "g1", title: "My Developer Journey", slug: "dev-journey", excerpt: "3 years of lessons learned the hard way", date: "Jan 8, 2025", tags: ["career", "personal"], readingTime: "5 min read", content: ["para1", "para2"] },
    { _id: "g2", title: "Remote Work Tips That Work", slug: "remote-tips", excerpt: "Practical habits for working from home", date: "Jan 2, 2025", tags: ["productivity"], readingTime: "4 min read", content: ["para1"] },
];

export default function MyPosts() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [techPosts, setTechPosts] = useState([]);
    const [genPosts, setGenPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all"); // "all" | "tech" | "general"
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    /* ── Auth check + fetch posts ── */
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/"); return; }

        const decoded = jwtDecode(token);

        console.log(decoded.id);

        authService.getMe()
            .then(res => setUser(res.data.user))
            .catch(() => { localStorage.removeItem("accessToken"); navigate("/"); });

        Promise.allSettled([techApi.getAll(), genApi.getAllByUser(decoded.id)])
            .then(([tr, gr]) => {
                setTechPosts(tr.status === "fulfilled" ? (Array.isArray(tr.value.data.data) ? tr.value.data.data : tr.value.data?.data.data ?? MOCK_TECH) : MOCK_TECH);
                setGenPosts(gr.status === "fulfilled" ? (Array.isArray(gr.value.data) ? gr.value.data : gr.value.data?.data  ?? MOCK_GEN) : MOCK_GEN);
            })
            .finally(() => setLoading(false));
    }, []);

    /* ── Delete ── */
    async function confirmDelete() {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            if (deleteTarget.type === "tech") {
                await techApi.delete(deleteTarget.post._id);
                setTechPosts(p => p.filter(b => b._id !== deleteTarget.post._id));
            } else {
                await genApi.delete(deleteTarget.post._id);
                setGenPosts(p => p.filter(b => b._id !== deleteTarget.post._id));
            }
        } catch {
            if (deleteTarget.type === "tech") setTechPosts(p => p.filter(b => b._id !== deleteTarget.post._id));
            else setGenPosts(p => p.filter(b => b._id !== deleteTarget.post._id));
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    }

    /* ── Filter + search ── */
    function filterPosts(posts) {
        if (!search.trim()) return posts;
        const q = search.toLowerCase();
        return posts.filter(p =>
            p.title?.toLowerCase().includes(q) ||
            p.tags?.some(t => t.toLowerCase().includes(q)) ||
            p.slug?.toLowerCase().includes(q)
        );
    }

    const filteredTech = filterPosts(techPosts);
    const filteredGen = filterPosts(genPosts);
    const totalPosts = techPosts.length + genPosts.length;

    const visibleTech = activeTab === "all" || activeTab === "tech";
    const visibleGen = activeTab === "all" || activeTab === "general";

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans">

            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                                    <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-base sm:text-lg font-black text-gray-900">My Posts</h1>
                                <p className="text-xs text-gray-400 hidden sm:block">{totalPosts} total posts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate("/admin/tech/create")}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 text-sm font-bold hover:bg-violet-200 transition-all">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                                Tech Post
                            </button>
                            <button onClick={() => navigate("/admin/general/create")}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 text-sm font-bold hover:bg-sky-200 transition-all">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                                General Post
                            </button>
                            {/* Mobile create button */}
                            <button onClick={() => navigate("/admin")}
                                className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white text-sm font-bold">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                                New
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 space-y-5">

                {/* ── Stats row ── */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Total Posts", value: totalPosts, color: "from-violet-600 to-pink-500" },
                        { label: "Tech Posts", value: techPosts.length, color: "from-violet-500 to-violet-700" },
                        { label: "General Posts", value: genPosts.length, color: "from-sky-500 to-blue-600" },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
                            <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs + Search ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-shrink-0">
                        {[
                            { key: "all", label: "All", count: totalPosts },
                            { key: "tech", label: "Tech", count: techPosts.length },
                            { key: "general", label: "General", count: genPosts.length },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.key
                                        ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}>
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                                    }`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search posts by title or tag…"
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm" />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Tech Posts Section ── */}
                {visibleTech && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-violet-500" />
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tech Posts</h2>
                                <span className="text-xs text-gray-400">({filteredTech.length})</span>
                            </div>
                            <button onClick={() => navigate("/admin/tech/create")}
                                className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors">
                                + New
                            </button>
                        </div>

                        {filteredTech.length === 0 ? (
                            <EmptyState type="tech" onAdd={() => navigate("/admin/tech/create")} search={search} />
                        ) : (
                            <div className="space-y-3">
                                {filteredTech.map((post, i) => (
                                    <TechPostCard key={post._id} post={post} index={i}
                                        onEdit={() => navigate(`/admin/tech/edit/${post._id}`)}
                                        onDelete={() => setDeleteTarget({ type: "tech", post })} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── General Posts Section ── */}
                {visibleGen && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">General Posts</h2>
                                <span className="text-xs text-gray-400">({filteredGen.length})</span>
                            </div>
                            <button onClick={() => navigate("/admin/general/create")}
                                className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                                + New
                            </button>
                        </div>

                        {filteredGen.length === 0 ? (
                            <EmptyState type="general" onAdd={() => navigate("/admin/general/create")} search={search} />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredGen.map((post, i) => (
                                    <GenPostCard key={post._id} post={post} index={i}
                                        onEdit={() => navigate(`/admin/general/edit/${post._id}`)}
                                        onDelete={() => setDeleteTarget({ type: "general", post })} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Nothing found ── */}
                {search && filteredTech.length === 0 && filteredGen.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="font-bold text-gray-900">No results for "{search}"</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        <button onClick={() => setSearch("")}
                            className="mt-4 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                            Clear search
                        </button>
                    </div>
                )}
            </div>

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setDeleteTarget(null)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] p-6 w-full max-w-sm pointer-events-auto">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-red-500">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-center font-black text-gray-900 mb-2">Delete Post?</h3>
                            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
                                Delete <span className="font-bold text-gray-800">"{deleteTarget.post.title?.slice(0, 40)}…"</span>? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-700 border-2 border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
                                    Cancel
                                </button>
                                <button onClick={confirmDelete} disabled={deleteLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                    {deleteLoading
                                        ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Tech Post Card ── */
function TechPostCard({ post, index, onEdit, onDelete }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-violet-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-all duration-200 overflow-hidden group">
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-violet-700" />
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${post.difficulty === "Beginner" ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : post.difficulty === "Advanced" ? "bg-red-100 text-red-600 border border-red-200"
                                        : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                                {post.difficulty}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">{post.readingTime}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{post.content?.length ?? 0} blocks</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-violet-700 transition-colors mb-1.5">
                            {post.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {post.tags?.slice(0, 4).map(t => (
                                <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">{t}</span>
                            ))}
                        </div>

                        {/* Meta */}
                        <p className="text-[11px] text-gray-400 mt-2 font-mono">/{post.slug} · {post.date}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={onEdit}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all">
                            Edit
                        </button>
                        <button onClick={onDelete}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── General Post Card ── */
function GenPostCard({ post, index, onEdit, onDelete }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-sky-200 hover:shadow-[0_4px_20px_rgba(14,165,233,0.08)] transition-all duration-200 overflow-hidden group flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-blue-600" />
            <div className="p-4 flex flex-col flex-1">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags?.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">{t}</span>
                    ))}
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-sky-700 transition-colors mb-1.5 line-clamp-2">
                    {post.title}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-2">{post.excerpt}</p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-[10px] font-mono text-gray-400">/{post.slug}</p>
                        <p className="text-[10px] text-gray-400">{post.date} · {post.content?.length ?? 0} paragraphs</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={onEdit}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all">
                            Edit
                        </button>
                        <button onClick={onDelete}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Empty State ── */
function EmptyState({ type, onAdd, search }) {
    const isTech = type === "tech";
    return (
        <div className={`flex flex-col items-center py-10 text-center border-2 border-dashed rounded-2xl ${isTech ? "border-violet-200 bg-violet-50/50" : "border-sky-200 bg-sky-50/50"}`}>
            <p className="text-3xl mb-2">{isTech ? "💻" : "📝"}</p>
            <p className={`font-bold text-sm ${isTech ? "text-violet-700" : "text-sky-700"}`}>
                {search ? `No ${type} posts match "${search}"` : `No ${type} posts yet`}
            </p>
            {!search && (
                <button onClick={onAdd}
                    className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${isTech ? "bg-violet-600 hover:bg-violet-700" : "bg-sky-500 hover:bg-sky-600"}`}>
                    + Create first {type} post
                </button>
            )}
        </div>
    );
}

/* ── Loading Screen ── */
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#f8f9fb]">
            <div className="bg-white border-b border-gray-200 h-16" />
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white border border-gray-200 rounded-2xl animate-pulse" />)}</div>
                <div className="h-12 bg-white border border-gray-200 rounded-xl animate-pulse" />
                {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white border border-gray-200 rounded-2xl animate-pulse" />)}
            </div>
        </div>
    );
}