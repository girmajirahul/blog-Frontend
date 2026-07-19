import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { genApi } from "../../api/index";
import { Input, Textarea } from "../../components/Field";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";
import { generateSlug, todayString, estimateReadingTimeFromStrings, parseTags, debounce } from "../../utils/helpers";

const BLANK = {
  title: "", slug: "", excerpt: "", date: "", readingTime: "",
  tags: "", coverImage: "",
};

export default function GeneralBlogForm({ onToast }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(BLANK);
  const [paragraphs, setParagraphs] = useState([""]);   // content: [String]
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [slugLocked, setSlugLocked] = useState(false);
  const [preview, setPreview] = useState(false);

  /* fetch for edit */
  useEffect(() => {
    if (!isEdit) { setForm(f => ({ ...f, date: todayString() })); return; }
    genApi.getBySlug(id).then(res => {
      const b = res.data?.data ?? res.data;
      setForm({
        title: b.title ?? "",
        slug: b.slug ?? "",
        excerpt: b.excerpt ?? "",
        date: b.date ?? "",
        readingTime: b.readingTime ?? "",
        tags: (b.tags ?? []).join(", "),
        coverImage: b.coverImage ?? "",
      });
      setParagraphs(Array.isArray(b.content) && b.content.length > 0 ? b.content : [""]);
      setSlugLocked(true);
    }).catch(() => onToast?.("Could not load post.", "error"))
      .finally(() => setFetching(false));
  }, [id]);

  /* auto-slug */
  const autoSlug = useCallback(debounce(t => {
    if (!slugLocked) setForm(f => ({ ...f, slug: generateSlug(t) }));
  }, 250), [slugLocked]);

  /* auto reading time from paragraphs */
  useEffect(() => {
    setForm(f => ({ ...f, readingTime: estimateReadingTimeFromStrings(paragraphs) }));
  }, [paragraphs]);

  function handleField(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: "" }));
    if (name === "title") autoSlug(value);
    if (name === "slug") setSlugLocked(true);
  }

  /* ── Paragraph CRUD ──────────────────────────────────────── */
  function updatePara(i, val) { setParagraphs(p => p.map((x, k) => k === i ? val : x)); }
  function addPara() { setParagraphs(p => [...p, ""]); }
  function removePara(i) { setParagraphs(p => p.filter((_, k) => k !== i)); }
  function movePara(i, dir) {
    setParagraphs(p => {
      const n = [...p]; const j = i + dir;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]]; return n;
    });
  }

  /* ── Validation ──────────────────────────────────────────── */
  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.excerpt.trim()) e.excerpt = "Excerpt is required";
    if (!form.date.trim()) e.date = "Date is required";
    const filled = paragraphs.filter(p => p.trim());
    if (filled.length === 0) e.content = "Add at least one paragraph";
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
      readingTime: form.readingTime || estimateReadingTimeFromStrings(paragraphs),
      tags: parseTags(form.tags),
      coverImage: form.coverImage.trim(),
      content: paragraphs.filter(p => p.trim()),
    };
    try {
      if (isEdit) { await genApi.update(id, payload); onToast?.("Blog updated!", "success"); }
      else { await genApi.create(payload); onToast?.("Blog published!", "success"); }
      navigate("/admin/general");
    } catch (err) {
      onToast?.(err.userMessage ?? "Failed to save.", "error");
    } finally { setLoading(false); }
  }

  if (fetching) return <PageWrapper><Loading /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-24 md:pb-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-gen" />
              <span className="text-xs font-bold text-gen-dark uppercase tracking-widest">General Blog</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">{isEdit ? "Edit Post" : "New General Blog"}</h1>
            <p className="text-sm text-ink-secondary mt-0.5">Simple text paragraphs with cover image and tags</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPreview(p => !p)}>
            {preview ? "← Edit" : "Preview"}
          </Button>
        </div>

        {preview ? <Preview form={form} paragraphs={paragraphs} /> : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Meta Card ────────────────────────────────── */}
            <Card title="Post Details" accent="gen">
              <div className="space-y-4">
                <Input label="Title" id="title" name="title" value={form.title} onChange={handleField}
                  placeholder="e.g. My Developer Journey in 2025" error={errors.title} required accent="sky" />

                {/* Slug */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-ink">Slug</label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted border border-border">
                      {slugLocked ? "manual" : "auto"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-white border border-border hover:border-border-strong rounded-lg overflow-hidden focus-within:border-gen focus-within:ring-2 focus-within:ring-gen/20">
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
                  rows={2} placeholder="A short description shown in listings…" error={errors.excerpt} required accent="sky"
                  hint={`${form.excerpt.length}/300 characters`} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Date" id="date" name="date" value={form.date} onChange={handleField}
                    placeholder="January 10, 2025" error={errors.date} required accent="sky" hint='e.g. "January 10, 2025"' />
                  <Input label="Reading Time" id="readingTime" name="readingTime" value={form.readingTime} onChange={handleField}
                    placeholder="Auto-estimated" accent="sky" hint="Auto-calculated from paragraphs" />
                </div>

                <Input label="Tags" id="tags" name="tags" value={form.tags} onChange={handleField}
                  placeholder="career, tips, javascript" accent="sky" hint="Comma-separated" />

                <Input label="Cover Image URL" id="coverImage" name="coverImage" value={form.coverImage} onChange={handleField}
                  placeholder="https://example.com/cover.jpg" accent="sky" hint="Optional — shown as hero image" />

                {/* Cover preview */}
                {form.coverImage && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img src={form.coverImage} alt="Cover preview" className="w-full h-36 object-cover"
                      onError={e => { e.target.style.display = "none"; }} />
                  </div>
                )}
              </div>
            </Card>

            {/* ── Content (paragraphs) ──────────────────────── */}
            <Card title="Content — Paragraphs" accent="gen"
              extra={errors.content && <span className="text-xs text-danger">{errors.content}</span>}>

              <AnimatePresence>
                {paragraphs.map((para, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-gen-muted uppercase tracking-widest">Paragraph {i + 1}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        <IconBtn onClick={() => movePara(i, -1)} disabled={i === 0} title="Move up">↑</IconBtn>
                        <IconBtn onClick={() => movePara(i, 1)} disabled={i === paragraphs.length - 1} title="Move down">↓</IconBtn>
                        <IconBtn onClick={() => removePara(i)} disabled={paragraphs.length <= 1} danger title="Remove">✕</IconBtn>
                      </div>
                    </div>
                    <textarea rows={5} value={para} onChange={e => updatePara(i, e.target.value)}
                      placeholder={`Write paragraph ${i + 1} here…`}
                      className="w-full text-sm border border-border hover:border-border-strong rounded-lg px-3 py-2.5 focus:outline-none focus:border-gen focus:ring-2 focus:ring-gen/20 resize-y leading-relaxed bg-white placeholder:text-ink-muted transition-all" />
                  </motion.div>
                ))}
              </AnimatePresence>

              <button type="button" onClick={addPara}
                className="w-full py-2.5 text-sm font-medium text-gen-dark border-2 border-dashed border-gen-border rounded-lg hover:bg-gen-light hover:border-gen transition-all">
                + Add Paragraph
              </button>

              <p className="text-xs text-ink-muted mt-2 text-center">
                {paragraphs.filter(p => p.trim()).length} paragraph{paragraphs.filter(p => p.trim()).length !== 1 ? "s" : ""} · {paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </Card>

            {/* ── Actions ───────────────────────────────────── */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => navigate("/admin/general")}>
                ← Cancel
              </Button>
              <Button type="submit" variant="sky" loading={loading} disabled={loading}>
                {loading ? (isEdit ? "Saving…" : "Publishing…") : (isEdit ? "Save Changes" : "Publish Blog")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}

/* ── Preview ─────────────────────────────────────────────────── */
function Preview({ form, paragraphs }) {
  const tags = (form.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-white border border-border rounded-xl overflow-hidden shadow-card">
      {form.coverImage && (
        <img src={form.coverImage} alt="Cover" className="w-full h-48 object-cover"
          onError={e => { e.target.style.display = "none"; }} />
      )}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => <span key={t} className="tag-gen">#{t}</span>)}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
          {form.title || <span className="text-ink-muted italic">No title yet…</span>}
        </h1>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          {form.date && <span>{form.date}</span>}
          {form.readingTime && <><span>·</span><span>{form.readingTime}</span></>}
          {form.slug && <><span>·</span><span className="font-mono">/{form.slug}</span></>}
        </div>
        {form.excerpt && (
          <p className="text-base text-ink-secondary italic border-l-2 border-gen pl-4 leading-relaxed">{form.excerpt}</p>
        )}
        <div className="space-y-4 pt-2">
          {paragraphs.filter(p => p.trim()).length === 0
            ? <p className="text-ink-muted italic">No content yet…</p>
            : paragraphs.filter(p => p.trim()).map((p, i) => (
              <p key={i} className="text-sm text-ink leading-relaxed">{p}</p>
            ))
          }
        </div>
      </div>
    </motion.div>
  );
}

/* ── Small helpers ───────────────────────────────────────────── */
function Card({ title, accent = "gen", extra, children }) {
  const bar = accent === "gen" ? "bg-gen" : "bg-tech";
  return (
    <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2"><span className={`w-1 h-4 rounded-full ${bar}`} /><h2 className="text-sm font-semibold text-ink">{title}</h2></div>
        {extra}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, danger, title }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`w-6 h-6 text-xs flex items-center justify-center rounded transition-all disabled:opacity-30 ${danger ? "hover:bg-danger-light hover:text-danger text-ink-muted" : "hover:bg-surface-hover text-ink-muted hover:text-ink"}`}>
      {children}
    </button>
  );
}

function Loading() {
  return <div className="p-6 max-w-3xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-surface-hover rounded-xl animate-pulse" />)}</div>;
}
