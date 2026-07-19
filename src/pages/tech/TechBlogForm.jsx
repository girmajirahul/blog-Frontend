import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { techApi } from "../../api/index";
import { Input, Textarea, Select } from "../../components/Field";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";
import { generateSlug, todayString, estimateReadingTime, parseTags, debounce } from "../../utils/helpers";

/* ── Content block definitions (matching TechBlog schema) ─────── */
const BLOCK_TYPES = [
  { type: "p", label: "Paragraph", fields: ["text"] },
  { type: "h2", label: "Heading", fields: ["text"] },
  { type: "list", label: "Bullet List", fields: ["items"] },
  { type: "numbered", label: "Numbered List", fields: ["items"] },
  { type: "code", label: "Code Block", fields: ["code", "language", "filename"] },
  { type: "callout", label: "Callout", fields: ["text", "tone"] },
  { type: "image", label: "Image", fields: ["src", "alt"] },
  { type: "divider", label: "Divider", fields: [] },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const BLANK_FORM = {
  title: "", slug: "", excerpt: "", date: "", readingTime: "",
  tags: "", stack: "", featured: false, difficulty: "Intermediate",
};

function blankBlock(type) {
  return { type, text: "", items: [""], language: "javascript", filename: "", code: "", tone: "info", src: "", alt: "" };
}

/* ── Helpers ─────────────────────────────────────────────────── */
function cleanBlock(b) {
  const out = { type: b.type };
  const def = BLOCK_TYPES.find(d => d.type === b.type);
  if (!def) return out;
  def.fields.forEach(f => {
    if (f === "items") out.items = (b.items || [""]).filter(Boolean);
    else if (b[f] !== undefined && b[f] !== "") out[f] = b[f];
  });
  return out;
}

export default function TechBlogForm({ onToast }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(BLANK_FORM);
  const [blocks, setBlocks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [slugLocked, setSlugLocked] = useState(false);

  /* fetch for edit */
  useEffect(() => {
    if (!isEdit) { setForm(f => ({ ...f, date: todayString() })); return; }
    techApi.getBySlug(id).then(res => {
      const b = res.data?.data ?? res.data;
      setForm({
        title: b.title ?? "",
        slug: b.slug ?? "",
        excerpt: b.excerpt ?? "",
        date: b.date ?? "",
        readingTime: b.readingTime ?? "",
        tags: (b.tags ?? []).join(", "),
        stack: (b.stack ?? []).join(", "),
        featured: b.featured ?? false,
        difficulty: b.difficulty ?? "Intermediate",
      });
      setBlocks(b.content ?? []);
      setSlugLocked(true);
    }).catch(() => onToast?.("Could not load post.", "error"))
      .finally(() => setFetching(false));
  }, [id]);

  /* auto-slug */
  const autoSlug = useCallback(debounce(t => {
    if (!slugLocked) setForm(f => ({ ...f, slug: generateSlug(t) }));
  }, 250), [slugLocked]);

  /* auto reading time */
  useEffect(() => {
    if (blocks.length > 0) {
      setForm(f => ({ ...f, readingTime: estimateReadingTime(blocks) }));
    }
  }, [blocks]);

  function handleField(e) {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;
    setForm(f => ({ ...f, [name]: v }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: "" }));
    if (name === "title") autoSlug(value);
    if (name === "slug") setSlugLocked(true);
  }

  /* ── Blocks CRUD ─────────────────────────────────────────── */
  function addBlock(type) {
    setBlocks(b => [...b, blankBlock(type)]);
  }
  function removeBlock(i) {
    setBlocks(b => b.filter((_, idx) => idx !== i));
  }
  function moveBlock(i, dir) {
    setBlocks(b => {
      const n = [...b];
      const j = i + dir;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }
  function updateBlock(i, field, value) {
    setBlocks(b => b.map((bl, idx) => idx === i ? { ...bl, [field]: value } : bl));
  }
  function updateBlockItem(i, itemIdx, value) {
    setBlocks(b => b.map((bl, idx) => {
      if (idx !== i) return bl;
      const items = [...(bl.items || [""])];
      items[itemIdx] = value;
      return { ...bl, items };
    }));
  }
  function addItem(i) {
    setBlocks(b => b.map((bl, idx) => idx === i ? { ...bl, items: [...(bl.items || [""]), ""] } : bl));
  }
  function removeItem(i, itemIdx) {
    setBlocks(b => b.map((bl, idx) => {
      if (idx !== i) return bl;
      return { ...bl, items: bl.items.filter((_, k) => k !== itemIdx) };
    }));
  }

  /* ── Validation ──────────────────────────────────────────── */
  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.excerpt.trim()) e.excerpt = "Excerpt is required";
    if (!form.date.trim()) e.date = "Date is required";
    if (blocks.length === 0) e.blocks = "Add at least one content block";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ──────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt.trim(),
      date: form.date.trim(),
      readingTime: form.readingTime || estimateReadingTime(blocks),
      tags: parseTags(form.tags),
      stack: parseTags(form.stack),
      featured: form.featured,
      difficulty: form.difficulty,
      content: blocks.map(cleanBlock),
    };
    try {
      if (isEdit) { await techApi.update(id, payload); onToast?.("Tech blog updated!", "success"); }
      else { await techApi.create(payload); onToast?.("Tech blog published!", "success"); }
      navigate("/admin/tech");
    } catch (err) {
      onToast?.(err.userMessage ?? "Failed to save.", "error");
    } finally { setLoading(false); }
  }

  if (fetching) return <PageWrapper><Loading /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-24 md:pb-10">

        {/* Page title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-tech" />
            <span className="text-xs font-semibold text-tech uppercase tracking-widest">Tech Blog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">{isEdit ? "Edit Post" : "New Tech Blog"}</h1>
          <p className="text-sm text-ink-secondary mt-0.5">Structured content with code blocks, difficulty levels and stack tags</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Meta card ─────────────────────────────────── */}
          <Card title="Post Details" accent="tech">
            <div className="space-y-4">
              <Input label="Title" id="title" name="title" value={form.title} onChange={handleField}
                placeholder="e.g. Building a REST API with Node.js" error={errors.title} required accent="tech" />

              {/* Slug row */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-ink">Slug</label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted border border-border">
                    {slugLocked ? "manual" : "auto"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-white border border-border hover:border-border-strong rounded-lg overflow-hidden focus-within:border-tech focus-within:ring-2 focus-within:ring-tech/20">
                    <span className="px-3 text-ink-muted text-sm font-mono select-none border-r border-border bg-surface-base py-2.5">/</span>
                    <input name="slug" value={form.slug} onChange={handleField}
                      placeholder="auto-generated-slug"
                      className="flex-1 px-3 py-2.5 text-sm text-ink bg-transparent focus:outline-none font-mono" />
                  </div>
                  {slugLocked && (
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setSlugLocked(false); setForm(f => ({ ...f, slug: generateSlug(f.title) })); }}>
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              <Textarea label="Excerpt" id="excerpt" name="excerpt" value={form.excerpt} onChange={handleField}
                rows={2} placeholder="A short summary shown in listings…" error={errors.excerpt} required accent="tech"
                hint={`${form.excerpt.length}/300 characters`} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Date" id="date" name="date" value={form.date} onChange={handleField}
                  placeholder="January 10, 2025" error={errors.date} required accent="tech"
                  hint='e.g. "January 10, 2025"' />
                <Input label="Reading Time" id="readingTime" name="readingTime" value={form.readingTime} onChange={handleField}
                  placeholder="Auto-estimated" accent="tech" hint="Auto-calculated from content blocks" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Tags" id="tags" name="tags" value={form.tags} onChange={handleField}
                  placeholder="react, node, api" accent="tech" hint="Comma-separated" />
                <Input label="Stack" id="stack" name="stack" value={form.stack} onChange={handleField}
                  placeholder="React, Express, MongoDB" accent="tech" hint="Technologies used" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <Select label="Difficulty" id="difficulty" name="difficulty" value={form.difficulty} onChange={handleField} accent="tech">
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </Select>
                <label className="flex items-center gap-3 px-4 py-3 bg-surface-base border border-border rounded-lg cursor-pointer hover:bg-surface-hover transition-colors">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleField}
                    className="w-4 h-4 rounded accent-tech" />
                  <div>
                    <p className="text-sm font-medium text-ink">Featured Post</p>
                    <p className="text-xs text-ink-muted">Show on homepage spotlight</p>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* ── Content Blocks ─────────────────────────────── */}
          <Card title="Content Blocks" accent="tech"
            extra={errors.blocks && <span className="text-xs text-danger">{errors.blocks}</span>}>

            {/* Block list */}
            <AnimatePresence>
              {blocks.map((block, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="border border-border rounded-xl overflow-hidden bg-white mb-3"
                >
                  {/* Block header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-base border-b border-border">
                    <span className="block-type">{block.type}</span>
                    <span className="text-xs text-ink-muted flex-1">Block {i + 1}</span>
                    <div className="flex items-center gap-1">
                      <IconBtn onClick={() => moveBlock(i, -1)} disabled={i === 0} title="Move up">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </IconBtn>
                      <IconBtn onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} title="Move down">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </IconBtn>
                      <IconBtn onClick={() => removeBlock(i)} title="Remove" danger>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                      </IconBtn>
                    </div>
                  </div>

                  {/* Block fields */}
                  <div className="p-3 space-y-3">
                    <BlockFields block={block} idx={i}
                      update={updateBlock} updateItem={updateBlockItem}
                      addItem={addItem} removeItem={removeItem} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {blocks.length === 0 && (
              <div className="border-2 border-dashed border-tech-border rounded-xl py-8 text-center text-sm text-tech-muted mb-3">
                No content blocks yet — add one below
              </div>
            )}

            {/* Add block buttons */}
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Add Block</p>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map(def => (
                  <button key={def.type} type="button" onClick={() => addBlock(def.type)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-tech-border bg-tech-light text-tech-dark hover:bg-tech hover:text-white hover:border-tech transition-all font-medium">
                    + {def.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Actions ────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => navigate("/admin/tech")}>
              ← Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {loading ? (isEdit ? "Saving…" : "Publishing…") : (isEdit ? "Save Changes" : "Publish Tech Blog")}
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}

/* ── Block field renderer ───────────────────────────────────── */
function BlockFields({ block, idx, update, updateItem, addItem, removeItem }) {
  const ta = "w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 font-mono resize-y bg-white placeholder:text-ink-muted";
  const inp = "w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-tech focus:ring-2 focus:ring-tech/20 bg-white placeholder:text-ink-muted";

  switch (block.type) {
    case "p":
    case "h2":
      return (
        <textarea rows={block.type === "heading" ? 2 : 4} value={block.text ?? ""} onChange={e => update(idx, "text", e.target.value)}
          placeholder={block.type === "heading" ? "Section heading…" : "Write paragraph text here…"}
          className={ta} />
      );

    case "list":
    case "numbered":
      return (
        <div className="space-y-2">
          {(block.items || [""]).map((item, k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs text-ink-muted w-5 text-center flex-shrink-0 font-mono">
                {block.type === "numbered" ? `${k + 1}.` : "•"}
              </span>
              <input value={item} onChange={e => updateItem(idx, k, e.target.value)}
                placeholder={`Item ${k + 1}…`} className={`${inp} flex-1`} />
              <IconBtn onClick={() => removeItem(idx, k)} disabled={(block.items || []).length <= 1} danger>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </IconBtn>
            </div>
          ))}
          <button type="button" onClick={() => addItem(idx)}
            className="text-xs text-tech hover:text-tech-dark font-medium transition-colors">
            + Add item
          </button>
        </div>
      );

    case "code":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input value={block.language ?? ""} onChange={e => update(idx, "language", e.target.value)}
              placeholder="javascript" className={`${inp} w-36`} />
            <input value={block.filename ?? ""} onChange={e => update(idx, "filename", e.target.value)}
              placeholder="filename.js (optional)" className={`${inp} flex-1`} />
          </div>
          <textarea rows={8} value={block.code ?? ""} onChange={e => update(idx, "code", e.target.value)}
            placeholder="// Your code here…"
            className={`${ta} bg-[#1e1e2e] text-[#cdd6f4] border-[#313244]`} />
        </div>
      );

    case "callout":
      return (
        <div className="space-y-2">
          <select value={block.tone ?? ""} onChange={e => update(idx, "tone", e.target.value)}
            className={`${inp} w-36`}>
            {["info", "warning", "danger", "success", "tip"].map(t => <option key={t}>{t}</option>)}
          </select>
          <textarea rows={3} value={block.text ?? ""} onChange={e => update(idx, "text", e.target.value)}
            placeholder="Callout message…" className={ta} />
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <input value={block.src ?? ""} onChange={e => update(idx, "src", e.target.value)}
            placeholder="https://example.com/image.png" className={inp} />
          <input value={block.alt ?? ""} onChange={e => update(idx, "alt", e.target.value)}
            placeholder="Alt text (accessibility)" className={inp} />
        </div>
      );

    case "divider":
      return <div className="h-px bg-border rounded my-2 mx-4" />;

    default:
      return <p className="text-xs text-ink-muted italic">Unknown block type: {block.type}</p>;
  }
}

/* ── Shared small components ────────────────────────────────── */
function Card({ title, accent = "tech", extra, children }) {
  const bar = accent === "tech" ? "bg-tech" : "bg-gen";
  return (
    <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 border-b border-border`}>
        <div className="flex items-center gap-2">
          <span className={`w-1 h-4 rounded-full ${bar}`} />
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
        </div>
        {extra}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, danger, title }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`w-6 h-6 flex items-center justify-center rounded transition-all disabled:opacity-30 ${danger ? "hover:bg-danger-light hover:text-danger text-ink-muted" : "hover:bg-surface-hover text-ink-muted hover:text-ink"}`}>
      {children}
    </button>
  );
}

function Loading() {
  return <div className="p-6 max-w-3xl mx-auto space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface-hover rounded-xl animate-pulse" />)}</div>;
}
