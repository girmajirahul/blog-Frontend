import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { techApi, genApi } from "../api/index";
import PageWrapper from "../components/PageWrapper";
import { formatDate, truncate } from "../utils/helpers";

export default function Dashboard({ onToast }) {
  const [tech, setTech] = useState([]);
  const [gen, setGen] = useState([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    Promise.allSettled([techApi.getAll(), genApi.getAll()]).then(([tr, gr]) => {
      if (tr.status === "fulfilled") {
        const d = tr.value.data.data;
        setTech(Array.isArray(d) ? d : d?.data ?? MOCK_TECH);
      } else setTech(MOCK_TECH);
      if (gr.status === "fulfilled") {
        const d = gr.value.data;
        setGen(Array.isArray(d) ? d : d?.data?.data ?? MOCK_GEN);
      } else setGen(MOCK_GEN);
      setLoad(false);
    });
  }, []);

  const recentTech = [...tech].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)).slice(0, 4);
  const recentGen = [...gen].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)).slice(0, 4);

  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto pb-24 md:pb-8 space-y-8">

        {/* Header */}
        <div>
          <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-xl sm:text-2xl font-bold text-ink">
            Dashboard
          </motion.h1>
          <p className="text-sm text-ink-secondary mt-0.5">Manage all your blog content in one place</p>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Tech Posts" value={loading ? "—" : tech.length} accent="tech" icon={<CodeIcon />} delay={0} />
          <Stat label="General Posts" value={loading ? "—" : gen.length} accent="gen" icon={<DocIcon />} delay={0.05} />
          <Stat label="Tech Tags" value={loading ? "—" : [...new Set(tech.flatMap(b => b.tags ?? []))].length} accent="tech" icon={<TagIcon />} delay={0.1} />
          <Stat label="Gen Tags" value={loading ? "—" : [...new Set(gen.flatMap(b => b.tags ?? []))].length} accent="gen" icon={<TagIcon />} delay={0.15} />
        </div>

        {/* Two-column recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentSection
            title="Recent Tech Blogs" accent="tech"
            items={recentTech} loading={loading}
            createPath="/admin/tech/create" allPath="/admin/tech"
            renderTag={b => b.difficulty}
            tagClass={b => b.difficulty === "Beginner" ? "badge-beginner" : b.difficulty === "Advanced" ? "badge-advanced" : "badge-intermediate"}
          />
          <RecentSection
            title="Recent General Blogs" accent="gen"
            items={recentGen} loading={loading}
            createPath="/admin/general/create" allPath="/admin/general"
            renderTag={b => b.tags?.[0]}
            tagClass={() => "tag-gen"}
          />
        </div>

        {/* Quick create cards */}
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">Quick Create</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickCard
              to="/admin/tech/create"
              accent="tech"
              title="New Tech Blog"
              desc="Code snippets, structured content blocks, difficulty levels, stack tags"
              icon={<CodeIcon lg />}
            />
            <QuickCard
              to="/admin/general/create"
              accent="gen"
              title="New General Blog"
              desc="Simple text paragraphs, cover image, clean reading-focused format"
              icon={<DocIcon lg />}
            />
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function Stat({ label, value, accent, icon, delay }) {
  const colors = {
    tech: "bg-tech-light border-tech-border text-tech-dark",
    gen: "bg-gen-light border-gen-border text-gen-dark",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.28 }}
      className={`${colors[accent]} border rounded-xl p-4 flex items-center gap-3`}>
      <span className="opacity-60">{icon}</span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-[11px] font-medium opacity-70">{label}</p>
      </div>
    </motion.div>
  );
}

function RecentSection({ title, accent, items, loading, createPath, allPath, renderTag, tagClass }) {
  const headerColor = accent === "tech" ? "text-tech-dark" : "text-gen-dark";
  const dotColor = accent === "tech" ? "bg-tech" : "bg-gen";
  return (
    <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h2 className={`text-sm font-semibold ${headerColor}`}>{title}</h2>
        </div>
        <Link to={allPath} className="text-xs text-ink-muted hover:text-ink transition-colors">View all →</Link>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-surface-hover rounded-lg animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center px-4">
          <p className="text-sm text-ink-muted mb-3">No posts yet</p>
          <Link to={createPath} className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${accent === "tech" ? "bg-tech-light border-tech-border text-tech-dark" : "bg-gen-light border-gen-border text-gen-dark"}`}>
            Create first post
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((b, i) => (
            <motion.div key={b._id ?? i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-base transition-colors">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{b.title}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">{formatDate(b.date || b.createdAt)}</p>
              </div>
              {renderTag(b) && <span className={tagClass(b)}>{renderTag(b)}</span>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickCard({ to, accent, title, desc, icon }) {
  const colors = accent === "tech"
    ? "border-tech-border hover:border-tech bg-tech-light/40 hover:bg-tech-light"
    : "border-gen-border hover:border-gen bg-gen-light/40 hover:bg-gen-light";
  const text = accent === "tech" ? "text-tech-dark" : "text-gen-dark";
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Link to={to} className={`flex items-start gap-4 p-5 rounded-xl border transition-all duration-150 block ${colors}`}>
        <span className={`mt-0.5 ${text}`}>{icon}</span>
        <div>
          <p className={`font-semibold text-sm ${text}`}>{title}</p>
          <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* Icons */
const CodeIcon = ({ lg }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={lg ? "w-6 h-6" : "w-4 h-4"}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const DocIcon = ({ lg }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={lg ? "w-6 h-6" : "w-4 h-4"}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>;
const TagIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" strokeWidth={2.5} /></svg>;

const MOCK_TECH = [
  { _id: "t1", title: "Building a REST API with Express", slug: "rest-api-express", date: "Jan 10, 2025", tags: ["node", "express"], difficulty: "Intermediate", content: [] },
  { _id: "t2", title: "React 19 Concurrent Features", slug: "react-19-concurrent", date: "Jan 5, 2025", tags: ["react"], difficulty: "Advanced", content: [] },
];
const MOCK_GEN = [
  { _id: "g1", title: "My Developer Journey", slug: "developer-journey", date: "Jan 8, 2025", tags: ["career"], content: [] },
  { _id: "g2", title: "Remote Work Tips 2025", slug: "remote-work-tips", date: "Jan 2, 2025", tags: ["lifestyle"], content: [] },
];
