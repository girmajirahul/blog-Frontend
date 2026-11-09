
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";
import { techApi, genApi } from "../api";
import { jwtDecode } from "jwt-decode";

export default function MyPosts() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [techPosts, setTechPosts] = useState([]);
    const [genPosts, setGenPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Role-based navigation
    const isAdmin = user?.role === "admin";

    const getCreatePath = (type) => {
        if (isAdmin) {
            return type === "tech"
                ? "/admin/tech/create"
                : "/admin/general/create";
        }

        return type === "tech"
            ? "/tech/create"
            : "/general/create";
    };

    const getEditPath = (type, id) => {
        if (isAdmin) {
            return type === "tech"
                ? `/admin/tech/edit/${id}`
                : `/admin/general/edit/${id}`;
        }

        return type === "tech"
            ? `/tech/edit/${id}`
            : `/general/edit/${id}`;
    };

    // Fetch authenticated user and posts
    useEffect(() => {
        let mounted = true;

        const loadMyPosts = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                if (!token) {
                    navigate("/", { replace: true });
                    return;
                }

                let decoded;

                try {
                    decoded = jwtDecode(token);
                } catch {
                    localStorage.removeItem("accessToken");
                    navigate("/", { replace: true });
                    return;
                }

                if (!decoded?.id) {
                    localStorage.removeItem("accessToken");
                    navigate("/", { replace: true });
                    return;
                }

                const [userResult, techResult, generalResult] =
                    await Promise.allSettled([
                        authService.getMe(),
                        techApi.getAllByUser(decoded.id),
                        genApi.getAllByUser(decoded.id)
                    ]);

                if (userResult.status === "rejected") {
                    throw new Error("Authentication failed");
                }

                if (!mounted) return;

                const currentUser = userResult.value.data.user;

                setUser(currentUser);

                // Handle Tech API response
                if (techResult.status === "fulfilled") {
                    const response = techResult.value.data;

                    setTechPosts(
                        Array.isArray(response?.data)
                            ? response.data
                            : Array.isArray(response?.data?.data)
                                ? response.data.data
                                : []
                    );
                } else {
                    setTechPosts([]);
                }

                // Handle General API response
                if (generalResult.status === "fulfilled") {
                    const response = generalResult.value.data;

                    setGenPosts(
                        Array.isArray(response?.data)
                            ? response.data
                            : Array.isArray(response?.data?.data)
                                ? response.data.data
                                : Array.isArray(response)
                                    ? response
                                    : []
                    );
                } else {
                    setGenPosts([]);
                }

            } catch (error) {
                console.error("Failed to load posts:", error);

                localStorage.removeItem("accessToken");

                if (mounted) {
                    navigate("/", { replace: true });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadMyPosts();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    // Delete post
    async function confirmDelete() {
        if (!deleteTarget) return;

        setDeleteLoading(true);

        try {
            if (deleteTarget.type === "tech") {
                await techApi.delete(deleteTarget.post._id);

                setTechPosts(posts =>
                    posts.filter(post =>
                        post._id !== deleteTarget.post._id
                    )
                );
            } else {
                await genApi.delete(deleteTarget.post._id);

                setGenPosts(posts =>
                    posts.filter(post =>
                        post._id !== deleteTarget.post._id
                    )
                );
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert(
                error.response?.data?.message ||
                "Unable to delete post. Please try again."
            );
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    }

    // Filter and search
    function filterPosts(posts) {
        if (!search.trim()) return posts;

        const query = search.toLowerCase();

        return posts.filter(post =>
            post.title?.toLowerCase().includes(query) ||
            post.tags?.some(tag =>
                tag.toLowerCase().includes(query)
            ) ||
            post.slug?.toLowerCase().includes(query)
        );
    }

    const filteredTech = filterPosts(techPosts);
    const filteredGen = filterPosts(genPosts);

    const totalPosts = techPosts.length + genPosts.length;

    const visibleTech =
        activeTab === "all" || activeTab === "tech";

    const visibleGen =
        activeTab === "all" || activeTab === "general";

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center justify-between min-h-16 py-3">

                        <div className="flex items-center gap-3">

                            <button
                                onClick={() => navigate(-1)}
                                aria-label="Go back"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    className="w-4 h-4"
                                >
                                    <path
                                        d="M19 12H5M12 5l-7 7 7 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            <div>
                                <h1 className="text-base sm:text-lg font-black text-gray-900">
                                    My Posts
                                </h1>

                                <p className="text-xs text-gray-400 hidden sm:block">
                                    {totalPosts} total posts
                                </p>
                            </div>
                        </div>

                        {/* Desktop navigation */}
                        <div className="hidden sm:flex items-center gap-2">

                            <button
                                onClick={() => navigate(getCreatePath("tech"))}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 text-sm font-bold hover:bg-violet-200 transition-all"
                            >
                                + Tech Post
                            </button>

                            <button
                                onClick={() => navigate(getCreatePath("general"))}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 text-sm font-bold hover:bg-sky-200 transition-all"
                            >
                                + General Post
                            </button>
                        </div>

                        {/* Mobile navigation */}
                        <div className="sm:hidden flex items-center gap-2">

                            <button
                                onClick={() => navigate(getCreatePath("tech"))}
                                className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold"
                            >
                                + Tech
                            </button>

                            <button
                                onClick={() => navigate(getCreatePath("general"))}
                                className="px-3 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold"
                            >
                                + General
                            </button>

                        </div>

                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 space-y-5">

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">

                    {[
                        {
                            label: "Total Posts",
                            value: totalPosts,
                            color: "from-violet-600 to-pink-500"
                        },
                        {
                            label: "Tech Posts",
                            value: techPosts.length,
                            color: "from-violet-500 to-violet-700"
                        },
                        {
                            label: "General Posts",
                            value: genPosts.length,
                            color: "from-sky-500 to-blue-600"
                        }
                    ].map(stat => (
                        <div
                            key={stat.label}
                            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center"
                        >
                            <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                            </p>

                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                                {stat.label}
                            </p>
                        </div>
                    ))}

                </div>

                {/* Tabs and Search */}
                <div className="flex flex-col sm:flex-row gap-3">

                    <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-shrink-0">

                        {[
                            { key: "all", label: "All", count: totalPosts },
                            { key: "tech", label: "Tech", count: techPosts.length },
                            { key: "general", label: "General", count: genPosts.length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {tab.label}

                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                    activeTab === tab.key
                                        ? "bg-white/25 text-white"
                                        : "bg-gray-100 text-gray-500"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}

                    </div>

                    {/* Search */}
                    <div className="relative flex-1">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path
                                d="M21 21l-4.35-4.35"
                                strokeLinecap="round"
                            />
                        </svg>

                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search posts by title or tag..."
                            className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm"
                        />

                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}

                    </div>
                </div>

                {/* Tech Posts */}
                {visibleTech && (
                    <div>

                        <div className="flex items-center justify-between mb-3">

                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-violet-500" />

                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                    Tech Posts
                                </h2>

                                <span className="text-xs text-gray-400">
                                    ({filteredTech.length})
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(getCreatePath("tech"))}
                                className="text-xs font-bold text-violet-600 hover:text-violet-700"
                            >
                                + New
                            </button>

                        </div>

                        {filteredTech.length === 0 ? (
                            <EmptyState
                                type="tech"
                                onAdd={() => navigate(getCreatePath("tech"))}
                                search={search}
                            />
                        ) : (
                            <div className="space-y-3">

                                {filteredTech.map((post, i) => (
                                    <TechPostCard
                                        key={post._id}
                                        post={post}
                                        index={i}
                                        onEdit={() => navigate(getEditPath("tech", post._id))}
                                        onDelete={() => setDeleteTarget({
                                            type: "tech",
                                            post
                                        })}
                                    />
                                ))}

                            </div>
                        )}

                    </div>
                )}

                {/* General Posts */}
                {visibleGen && (
                    <div>

                        <div className="flex items-center justify-between mb-3">

                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-500" />

                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                    General Posts
                                </h2>

                                <span className="text-xs text-gray-400">
                                    ({filteredGen.length})
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(getCreatePath("general"))}
                                className="text-xs font-bold text-sky-600 hover:text-sky-700"
                            >
                                + New
                            </button>

                        </div>

                        {filteredGen.length === 0 ? (
                            <EmptyState
                                type="general"
                                onAdd={() => navigate(getCreatePath("general"))}
                                search={search}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                {filteredGen.map((post, i) => (
                                    <GenPostCard
                                        key={post._id}
                                        post={post}
                                        index={i}
                                        onEdit={() => navigate(getEditPath("general", post._id))}
                                        onDelete={() => setDeleteTarget({
                                            type: "general",
                                            post
                                        })}
                                    />
                                ))}

                            </div>
                        )}

                    </div>
                )}

                {/* No Search Results */}
                {search && filteredTech.length === 0 && filteredGen.length === 0 && (
                    <div className="text-center py-16">

                        <p className="text-4xl mb-3">🔍</p>

                        <p className="font-bold text-gray-900">
                            No results for "{search}"
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                            Try a different search term
                        </p>

                        <button
                            onClick={() => setSearch("")}
                            className="mt-4 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Clear search
                        </button>

                    </div>
                )}

            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={() => !deleteLoading && setDeleteTarget(null)}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

                        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto">

                            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
                                🗑
                            </div>

                            <h3 className="text-center font-black text-gray-900 mb-2">
                                Delete Post?
                            </h3>

                            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
                                Delete{" "}
                                <span className="font-bold text-gray-800">
                                    "{deleteTarget.post.title?.slice(0, 40)}"
                                </span>
                                ? This cannot be undone.
                            </p>

                            <div className="flex gap-3">

                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={deleteLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-700 border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>

                            </div>

                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

// Tech Post Card
function TechPostCard({ post, onEdit, onDelete }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-violet-200 hover:shadow-lg transition-all overflow-hidden group">

            <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-violet-700" />

            <div className="p-4 sm:p-5">

                <div className="flex items-start justify-between gap-4">

                    <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2 mb-2">

                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                post.difficulty === "Beginner"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : post.difficulty === "Advanced"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-amber-100 text-amber-700"
                            }`}>
                                {post.difficulty}
                            </span>

                            <span className="text-[10px] text-gray-400">
                                {post.readingTime}
                            </span>

                            <span className="text-[10px] text-gray-400">
                                {post.content?.length ?? 0} blocks
                            </span>

                        </div>

                        <h3
                            onClick={() => navigate(`/techblog/${post.slug}`)}
                            className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-violet-700 cursor-pointer mb-1.5"
                        >
                            {post.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {post.tags?.slice(0, 4).map(tag => (
                                <span
                                    key={tag}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <p className="text-[11px] text-gray-400 mt-2 font-mono">
                            /{post.slug} · {post.date}
                        </p>

                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">

                        <button
                            onClick={onEdit}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-700 hover:bg-violet-600 hover:text-white transition-all"
                        >
                            Edit
                        </button>

                        <button
                            onClick={onDelete}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}

// General Post Card
function GenPostCard({ post, onEdit, onDelete }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-sky-200 hover:shadow-lg transition-all overflow-hidden group flex flex-col">

            <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-blue-600" />

            <div className="p-4 flex flex-col flex-1">

                <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags?.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <h3
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="font-bold text-gray-900 text-sm leading-snug group-hover:text-sky-700 cursor-pointer mb-1.5 line-clamp-2"
                >
                    {post.title}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-2">
                    {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">

                    <div>
                        <p className="text-[10px] font-mono text-gray-400">
                            /{post.slug}
                        </p>

                        <p className="text-[10px] text-gray-400">
                            {post.date} · {post.content?.length ?? 0} paragraphs
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5">

                        <button
                            onClick={onEdit}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-700 hover:bg-sky-500 hover:text-white transition-all"
                        >
                            Edit
                        </button>

                        <button
                            onClick={onDelete}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                            Delete
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Empty State
function EmptyState({ type, onAdd, search }) {
    const isTech = type === "tech";

    return (
        <div className={`flex flex-col items-center py-10 text-center border-2 border-dashed rounded-2xl ${
            isTech
                ? "border-violet-200 bg-violet-50/50"
                : "border-sky-200 bg-sky-50/50"
        }`}>

            <p className="text-3xl mb-2">
                {isTech ? "💻" : "📝"}
            </p>

            <p className={`font-bold text-sm ${
                isTech ? "text-violet-700" : "text-sky-700"
            }`}>
                {search
                    ? `No ${type} posts match "${search}"`
                    : `No ${type} posts yet`
                }
            </p>

            {!search && (
                <button
                    onClick={onAdd}
                    className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                        isTech
                            ? "bg-violet-600 hover:bg-violet-700"
                            : "bg-sky-500 hover:bg-sky-600"
                    }`}
                >
                    + Create first {type} post
                </button>
            )}

        </div>
    );
}

// Loading Screen
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#f8f9fb]">

            <div className="bg-white border-b border-gray-200 h-16" />

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

                <div className="grid grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-20 bg-white border border-gray-200 rounded-2xl animate-pulse"
                        />
                    ))}
                </div>

                <div className="h-12 bg-white border border-gray-200 rounded-xl animate-pulse" />

                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-32 bg-white border border-gray-200 rounded-2xl animate-pulse"
                    />
                ))}

            </div>
        </div>
    );
}
