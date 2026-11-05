
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    BookOpen,
    Code2,
    FileText,
    Clock3,
    CalendarDays,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Trash2,
    X,
    Filter,
    Sparkles,
    Tag,
    RefreshCw,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { blogApi, techApi } from "../api";
import Button from "../components/Button";

export default function BlogList({ onToast }) {
    const navigate = useNavigate();

    // -----------------------------
    // State
    // -----------------------------

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType,setSelectedType]=useState("all")
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    const [page, setPage] = useState(1);
    const [limit] = useState(5);

    const [totalPages, setTotalPages] = useState(1);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [totalTechBlogs, setTotalTechBlogs] = useState(0);
    const [totalGeneralBlogs, setTotalGeneralBlogs] = useState(0);

    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const [delTarget, setDelTarget] = useState(null);
    const [delLoad, setDelLoad] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    // -----------------------------
    // Fetch Blogs
    // -----------------------------

    //   const fetchBlogs = async () => {
    //     try {
    //       setLoading(true);

    //       const response = await blogApi.getCommonBlogs(page, limit);

    //       const result = response.data.data;
    //       console.log(result)  
    //       setBlogs(result.data || []);
    //       setTotalPages(result.totalPages || 1);
    //       setTotalBlogs(result.totalBlogs || 0);
    //       setTotalTechBlogs(result.totalTechBlogs || 0);
    //       setTotalGeneralBlogs(result.totalBlogs - result.totalTechBlogs || 0);

    //       setHasNextPage(result.hasNextPage || false);
    //       setHasPreviousPage(result.hasPreviousPage || false);

    //     } catch (error) {
    //       console.error("Failed to fetch blogs:", error);
    //       setBlogs([]);
    //       onToast?.("Unable to load blogs.", "error");
    //     } finally {
    //       setLoading(false);
    //       setRefreshing(false);
    //     }
    //   };

    const fetchBlogs = async () => {
        try {
            setLoading(true);

            const response = await blogApi.getCommonBlogs(
                page,
                limit,
                selectedType
            );

            if (response.data.success) {
                const result = response.data;

                setBlogs(result.data || []);
                setTotalBlogs(result.totalBlogs || 0);
                setTotalTechBlogs(result.totalTechBlogs || 0);

                setTotalGeneralBlogs(
                    Math.max(
                        0,
                        (result.totalBlogs || 0) - (result.totalTechBlogs || 0)
                    )
                );

                setTotalPages(result.totalPages || 1);
                setHasNextPage(result.hasNextPage || false);
                setHasPreviousPage(result.hasPreviousPage || false);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            setBlogs([]);
            onToast?.("Unable to load blogs.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [page, limit, selectedType]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBlogs();
    };

    // -----------------------------
    // Blog Navigation
    // -----------------------------

    const getBlogPath = (blog) => {
        return blog.type === "techBlog"
            ? `/techblog/${blog.slug}`
            : `/general/view/${blog.slug}`;
    };

    // -----------------------------
    // Filtering and Sorting
    // -----------------------------

    const filteredBlogs = useMemo(() => {
        let result = [...blogs];

        // Content type filter
        if (activeTab === "general") {
            result = result.filter((blog) => blog.type === "blog");
        }

        if (activeTab === "technical") {
            result = result.filter((blog) => blog.type === "techBlog");
        }

        // Search
        if (search.trim()) {
            const query = search.toLowerCase();

            result = result.filter((blog) => {
                return (
                    blog.title?.toLowerCase().includes(query) ||
                    blog.slug?.toLowerCase().includes(query) ||
                    blog.excerpt?.toLowerCase().includes(query) ||
                    blog.tags?.some((tag) =>
                        tag.toLowerCase().includes(query)
                    ) ||
                    blog.stack?.some((stack) =>
                        stack.toLowerCase().includes(query)
                    )
                );
            });
        }

        // Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || 0);
            const dateB = new Date(b.createdAt || b.date || 0);

            if (sort === "newest") return dateB - dateA;

            if (sort === "oldest") return dateA - dateB;

            if (sort === "title") {
                return (a.title || "").localeCompare(b.title || "");
            }

            return 0;
        });

        return result;
    }, [blogs, activeTab, search, sort]);

    // -----------------------------
    // Delete Blog
    // -----------------------------

    const confirmDelete = async () => {
        if (!delTarget) return;

        try {
            setDelLoad(true);

            if (delTarget.type === "tech") {
                await techApi.delete(delTarget._id);
            } else {
                await blogApi.delete(delTarget._id);
            }

            setBlogs((previous) =>
                previous.filter((blog) => blog._id !== delTarget._id)
            );

            setTotalBlogs((previous) => Math.max(0, previous - 1));

            if (delTarget.type === "tech") {
                setTotalTechBlogs((previous) => Math.max(0, previous - 1));
            } else {
                setTotalGeneralBlogs((previous) => Math.max(0, previous - 1));
            }

            onToast?.("Blog deleted successfully.", "success");

            setDelTarget(null);

            // Refresh if the deleted item was the last item on this page
            if (blogs.length === 1 && page > 1) {
                setPage((previous) => previous - 1);
            } else {
                fetchBlogs();
            }

        } catch (error) {
            console.error("Delete error:", error);
            onToast?.("Failed to delete blog.", "error");
        } finally {
            setDelLoad(false);
        }
    };

    // -----------------------------
    // Date Formatting
    // -----------------------------

    const formatDate = (date) => {
        if (!date) return "No date";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) return date;

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // -----------------------------
    // Reset Filters
    // -----------------------------

    const clearFilters = () => {
        setSearch("");
        setActiveTab("all");
        setSort("newest");
        setPage(1);
    };

    // -----------------------------
    // UI
    // -----------------------------

    return (
        <div className="min-h-screen bg-[#F8F9FC]">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-10 pb-28 md:pb-10 space-y-8">

                {/* =========================
            HEADER
        ========================== */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />

                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                                Content Management
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            My Writing Space
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage, organize and explore all your published articles.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                            title="Refresh"
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "animate-spin" : ""}
                            />
                        </button>

                        <Link to="/admin/tech/create">
                            <Button variant="primary" icon={<Plus size={17} />}>
                                New Article
                            </Button>
                        </Link>

                    </div>
                </div>

                {/* =========================
            STATISTICS
        ========================== */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <StatCard
                        title="Total Articles"
                        value={totalBlogs}
                        icon={<BookOpen size={21} />}
                        color="indigo"
                    />

                    <StatCard
                        title="General Blogs"
                        value={totalGeneralBlogs}
                        icon={<FileText size={21} />}
                        color="emerald"
                    />

                    <StatCard
                        title="Technical Blogs"
                        value={totalTechBlogs}
                        icon={<Code2 size={21} />}
                        color="violet"
                    />

                </div>

                {/* =========================
            CONTENT SECTION
        ========================== */}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    {/* Tabs */}

                    <div className="px-4 sm:px-6 pt-5 border-b border-slate-100">

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                            <div className="flex items-center gap-1 overflow-x-auto">

                                <TabButton
                                    active={selectedType === "all"}
                                    onClick={() => {
                                        setSelectedType("all");
                                        setActiveTab("all");
                                        setPage(1);
                                    }}
                                    icon={<BookOpen size={15} />}
                                >
                                    All Articles
                                    <TabCount>{totalBlogs}</TabCount>
                                </TabButton>

                                <TabButton
                                    active={selectedType === "blog"}
                                    onClick={() => {
                                        setSelectedType("blog");
                                        setActiveTab("general");
                                        setPage(1);
                                    }}
                                    icon={<FileText size={15} />}
                                >
                                    General
                                    <TabCount>{totalGeneralBlogs}</TabCount>
                                </TabButton>

                                <TabButton
                                    active={selectedType === "tech"}
                                    onClick={() => {
                                        setSelectedType("techBlog");
                                        setActiveTab("technical");
                                        setPage(1);
                                    }}
                                    icon={<Code2 size={15} />}
                                >
                                    Technical
                                    <TabCount>{totalTechBlogs}</TabCount>
                                </TabButton>

                            </div>

                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                {filteredBlogs.length} articles on this page
                            </span>

                        </div>

                    </div>

                    {/* Search and Filters */}

                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3">

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Search by title, tags or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                            />

                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                >
                                    <X size={16} />
                                </button>
                            )}

                        </div>

                        <div className="flex items-center gap-2">

                            <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-slate-200 bg-white">

                                <Filter size={16} className="text-slate-400" />

                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="text-sm bg-transparent outline-none text-slate-600"
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                    <option value="title">Title A-Z</option>
                                </select>

                            </div>

                            {(search || activeTab !== "all" || sort !== "newest") && (
                                <button
                                    onClick={clearFilters}
                                    className="h-11 px-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                                >
                                    Reset
                                </button>
                            )}

                        </div>

                    </div>

                    {/* Article List */}

                    <div className="px-4 sm:px-6 pb-6">

                        {loading ? (
                            <Skeletons />
                        ) : filteredBlogs.length === 0 ? (
                            <EmptyState
                                search={search}
                                activeTab={activeTab}
                                onClear={clearFilters}
                            />
                        ) : (

                            <div className="space-y-3">

                                <AnimatePresence mode="popLayout">

                                    {filteredBlogs.map((blog, index) => (

                                        <motion.article
                                            key={blog._id}
                                            layout
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.2, delay: index * 0.025 }}
                                            className="group border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-indigo-200 hover:shadow-md transition-all"
                                        >

                                            <div className="flex items-start gap-4">

                                                {/* Article Icon */}

                                                <div
                                                    className={`hidden sm:flex shrink-0 w-12 h-12 rounded-xl items-center justify-center ${blog.type === "tech"
                                                        ? "bg-violet-50 text-violet-600"
                                                        : "bg-emerald-50 text-emerald-600"
                                                        }`}
                                                >
                                                    {blog.type === "tech" ? (
                                                        <Code2 size={22} />
                                                    ) : (
                                                        <FileText size={22} />
                                                    )}
                                                </div>

                                                {/* Content */}

                                                <div className="flex-1 min-w-0">

                                                    {/* Top Metadata */}

                                                    <div className="flex flex-wrap items-center gap-2 mb-2">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${blog.type === "tech"
                                                                ? "bg-violet-50 text-violet-700"
                                                                : "bg-emerald-50 text-emerald-700"
                                                                }`}
                                                        >
                                                            {blog.type === "tech" ? (
                                                                <Code2 size={11} />
                                                            ) : (
                                                                <FileText size={11} />
                                                            )}

                                                            {blog.type === "tech"
                                                                ? "Technical Article"
                                                                : "General Article"}
                                                        </span>

                                                        {blog.featured && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                                                <Sparkles size={11} />
                                                                Featured
                                                            </span>
                                                        )}

                                                        {blog.difficulty && blog.type === "tech" && (
                                                            <DifficultyBadge
                                                                difficulty={blog.difficulty}
                                                            />
                                                        )}

                                                    </div>

                                                    {/* Title */}

                                                    <Link to={getBlogPath(blog)}>

                                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                                                            {blog.title}
                                                        </h2>

                                                    </Link>

                                                    {/* Excerpt */}

                                                    {blog.excerpt && (
                                                        <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">
                                                            {blog.excerpt}
                                                        </p>
                                                    )}

                                                    {/* Tags */}

                                                    <div className="flex flex-wrap items-center gap-1.5 mt-3">

                                                        {blog.tags?.slice(0, 5).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-600"
                                                            >
                                                                <Tag size={10} />
                                                                {tag}
                                                            </span>
                                                        ))}

                                                        {blog.tags?.length > 5 && (
                                                            <span className="text-[11px] text-slate-400">
                                                                +{blog.tags.length - 5} more
                                                            </span>
                                                        )}

                                                        {blog.stack?.map((item) => (
                                                            <span
                                                                key={item}
                                                                className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600"
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}

                                                    </div>

                                                    {/* Footer Metadata */}

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">

                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CalendarDays size={13} />
                                                            {formatDate(blog.date || blog.createdAt)}
                                                        </span>

                                                        {blog.readingTime && (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Clock3 size={13} />
                                                                {blog.readingTime}
                                                            </span>
                                                        )}

                                                        <span className="hidden md:inline truncate max-w-[220px]">
                                                            /{blog.slug}
                                                        </span>

                                                        <Link
                                                            to={getBlogPath(blog)}
                                                            className="ml-auto inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Read article
                                                            <ArrowUpRight size={14} />
                                                        </Link>

                                                    </div>

                                                </div>

                                                {/* Delete Action */}

                                                <button
                                                    onClick={() => setDelTarget(blog)}
                                                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Delete article"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>

                                        </motion.article>

                                    ))}

                                </AnimatePresence>

                            </div>

                        )}

                    </div>

                    {/* Pagination */}

                    {!loading && totalPages > 1 && (

                        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                            <p className="text-sm text-slate-500">
                                Page{" "}
                                <span className="font-semibold text-slate-900">{page}</span>
                                {" "}of{" "}
                                <span className="font-semibold text-slate-900">
                                    {totalPages}
                                </span>
                                {" "}· {totalBlogs} articles
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={() => setPage((previous) => previous - 1)}
                                    disabled={!hasPreviousPage}
                                    className="h-9 px-3 rounded-lg border border-slate-200 text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <button
                                    onClick={() => setPage((previous) => previous + 1)}
                                    disabled={!hasNextPage}
                                    className="h-9 px-3 rounded-lg border border-slate-200 text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </div>

            {/* =========================
          DELETE CONFIRMATION
      ========================== */}

            <AnimatePresence>

                {delTarget && (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !delLoad && setDelTarget(null)}
                    >

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                        >

                            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                                <Trash2 size={22} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                Delete article?
                            </h3>

                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-800">
                                    "{delTarget.title}"
                                </span>
                                ? This action cannot be undone.
                            </p>

                            <div className="flex items-center justify-end gap-3 mt-6">

                                <button
                                    onClick={() => setDelTarget(null)}
                                    disabled={delLoad}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmDelete}
                                    disabled={delLoad}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                                >
                                    {delLoad ? "Deleting..." : "Delete Article"}
                                </button>

                            </div>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    );
}

// =================================
// STAT CARD
// =================================

function StatCard({ title, value, icon, color }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        violet: "bg-violet-50 text-violet-600",
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {title}
                    </p>

                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {value}
                    </p>
                </div>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>

            </div>

        </div>
    );
}

// =================================
// TAB BUTTON
// =================================

function TabButton({ active, onClick, icon, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${active
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
        >
            {icon}
            {children}
        </button>
    );
}

function TabCount({ children }) {
    return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
            {children}
        </span>
    );
}

// =================================
// DIFFICULTY BADGE
// =================================

function DifficultyBadge({ difficulty }) {
    const styles = {
        Beginner: "bg-green-50 text-green-700",
        Intermediate: "bg-amber-50 text-amber-700",
        Advanced: "bg-red-50 text-red-700",
    };

    return (
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${styles[difficulty] || "bg-slate-100 text-slate-600"}`}>
            {difficulty}
        </span>
    );
}

// =================================
// LOADING SKELETON
// =================================

function Skeletons() {
    return (
        <div className="space-y-3 animate-pulse">

            {[1, 2, 3, 4].map((item) => (

                <div
                    key={item}
                    className="border border-slate-100 rounded-xl p-5"
                >

                    <div className="h-5 w-32 bg-slate-100 rounded mb-4" />
                    <div className="h-5 w-3/4 bg-slate-100 rounded mb-3" />
                    <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />

                </div>

            ))}

        </div>
    );
}

// =================================
// EMPTY STATE
// =================================

function EmptyState({ search, activeTab, onClear }) {
    const title = search
        ? "No matching articles found"
        : activeTab === "technical"
            ? "No technical articles yet"
            : activeTab === "general"
                ? "No general articles yet"
                : "No articles published yet";

    const description = search
        ? "Try another title, keyword or tag."
        : "Your published articles will appear here.";

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                {activeTab === "technical" ? (
                    <Code2 size={28} />
                ) : (
                    <BookOpen size={28} />
                )}
            </div>

            <h3 className="text-lg font-bold text-slate-900">
                {title}
            </h3>

            <p className="text-sm text-slate-500 mt-2 max-w-sm">
                {description}
            </p>

            {search ? (
                <button
                    onClick={onClear}
                    className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                    Clear filters
                </button>
            ) : (
                <Link to="/admin/tech/create" className="mt-5">
                    <Button variant="primary" icon={<Plus size={16} />}>
                        Create Article
                    </Button>
                </Link>
            )}

        </div>
    );
}

// =================================
// DATE FORMATTER
// =================================

function formatDate(date) {
    if (!date) return "No date";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
