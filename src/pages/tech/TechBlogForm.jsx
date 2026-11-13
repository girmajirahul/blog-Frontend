
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, PenLine, ArrowLeft } from "lucide-react";

import { techApi } from "../../api/index";
import { Input, Textarea, Select } from "../../components/Field";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";
import {
  generateSlug,
  todayString,
  estimateReadingTime,
  parseTags,
  debounce,
} from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

import RichTextEditor from "../../components/RichTextEditor";
import { blocksToEditor, editorToBlocks } from "../../utils/editorConveter";


const DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const BLANK_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  date: "",
  readingTime: "",
  tags: "",
  stack: "",
  featured: false,
  difficulty: "Intermediate",
};

const EMPTY_DOCUMENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export default function TechBlogForm({ onToast }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { user } = useAuth();

  const returnUrl =
    user?.role === "admin" ? "/admin/tech" : "/my-posts";

  const [form, setForm] = useState(BLANK_FORM);
  const [editorContent, setEditorContent] = useState(EMPTY_DOCUMENT);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [slugLocked, setSlugLocked] = useState(false);
  const [preview, setPreview] = useState(false);

  // Load existing blog when editing
  useEffect(() => {
    if (!isEdit) {
      setForm((current) => ({
        ...current,
        date: todayString(),
      }));
      setFetching(false);
      return;
    }

    let active = true;

    async function loadBlog() {
      try {
        const response = await techApi.getBySlug(id);
        const blog = response.data?.data ?? response.data;

        if (!active) return;

        setForm({
          title: blog.title ?? "",
          slug: blog.slug ?? "",
          excerpt: blog.excerpt ?? "",
          date: blog.date ?? "",
          readingTime: blog.readingTime ?? "",
          tags: (blog.tags ?? []).join(", "),
          stack: (blog.stack ?? []).join(", "),
          featured: blog.featured ?? false,
          difficulty: blog.difficulty ?? "Intermediate",
        });

        setEditorContent(
          blocksToEditor(blog.content ?? [])
        );

        setSlugLocked(true);
      } catch (error) {
        if (active) {
          onToast?.("Could not load tech blog.", "error");
        }
      } finally {
        if (active) setFetching(false);
      }
    }

    loadBlog();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // Automatically generate slug from title
  const autoSlug = useCallback(
    debounce((title) => {
      if (!slugLocked) {
        setForm((current) => ({
          ...current,
          slug: generateSlug(title),
        }));
      }
    }, 250),
    [slugLocked]
  );

  function handleField(event) {
    const { name, value, type, checked } = event.target;

    const fieldValue =
      type === "checkbox" ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: fieldValue,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (name === "title") {
      autoSlug(value);
    }

    if (name === "slug") {
      setSlugLocked(true);
    }
  }

  // Update editor content and calculate reading time
  function handleEditorChange(document) {
    setEditorContent(document);

    const blocks = editorToBlocks(document);

    setForm((current) => ({
      ...current,
      readingTime: estimateReadingTime(blocks),
    }));

    if (errors.content) {
      setErrors((current) => ({
        ...current,
        content: "",
      }));
    }
  }

  // Validate form
  function validate() {
    const validationErrors = {};

    if (!form.title.trim()) {
      validationErrors.title = "Title is required";
    }

    if (!form.excerpt.trim()) {
      validationErrors.excerpt = "Excerpt is required";
    }

    if (!form.date.trim()) {
      validationErrors.date = "Date is required";
    }

    const blocks = editorToBlocks(editorContent);

    const hasContent = blocks.some((block) => {
      if (block.type === "divider") return false;

      if (block.type === "image") return Boolean(block.src);

      if (block.type === "code") return Boolean(block.code?.trim());

      if (block.type === "list" || block.type === "numbered") {
        return block.items?.some((item) => item.trim());
      }

      return Boolean(block.text?.trim());
    });

    if (!hasContent) {
      validationErrors.content =
        "Please write some content before publishing.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  // Submit blog
  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      setPreview(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    setLoading(true);

    const blocks = editorToBlocks(editorContent);

    const payload = {
      title: form.title.trim(),
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt.trim(),
      date: form.date.trim(),
      readingTime:
        form.readingTime || estimateReadingTime(blocks),
      tags: parseTags(form.tags),
      stack: parseTags(form.stack),
      featured: form.featured,
      difficulty: form.difficulty,
      content: blocks,
    };

    try {
      if (isEdit) {
        await techApi.update(id, payload);
        onToast?.("Tech blog updated successfully!", "success");
      } else {
        await techApi.create(payload);
        onToast?.("Tech blog published successfully!", "success");
      }

      navigate(returnUrl);
    } catch (error) {
      onToast?.(
        error.userMessage || "Failed to save tech blog.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-16 rounded-xl bg-surface-hover animate-pulse"
            />
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-24">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-tech" />
              <span className="text-xs font-semibold text-tech uppercase tracking-widest">
                Tech Blog Editor
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-ink">
              {isEdit ? "Edit your article" : "Create a new article"}
            </h1>

            <p className="text-sm text-ink-secondary mt-1">
              Write, format and preview your technical article.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPreview((current) => !current)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white hover:bg-surface-hover text-sm font-medium transition-colors"
          >
            {preview ? <PenLine size={16} /> : <Eye size={16} />}
            {preview ? "Continue Writing" : "Preview Article"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {!preview ? (
            <>
              {/* Post details */}
              <Card title="Article Details">
                <div className="space-y-4">

                  <Input
                    label="Article Title"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleField}
                    placeholder="e.g. Understanding the Node.js Event Loop"
                    error={errors.title}
                    required
                    accent="tech"
                  />

                  {/* Slug */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-ink">
                        URL Slug
                      </label>

                      <span className="text-xs text-ink-muted">
                        {slugLocked ? "Custom slug" : "Auto-generated"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center border border-border rounded-lg overflow-hidden">
                        <span className="px-3 py-2.5 bg-surface-base border-r border-border text-ink-muted">
                          /
                        </span>

                        <input
                          name="slug"
                          value={form.slug}
                          onChange={handleField}
                          className="flex-1 min-w-0 px-3 py-2.5 outline-none text-sm"
                          placeholder="article-url"
                        />
                      </div>

                      {slugLocked && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSlugLocked(false);
                            setForm((current) => ({
                              ...current,
                              slug: generateSlug(current.title),
                            }));
                          }}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>

                  <Textarea
                    label="Article Excerpt"
                    id="excerpt"
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleField}
                    rows={3}
                    placeholder="Write a short description of your article..."
                    error={errors.excerpt}
                    required
                    accent="tech"
                    hint={`${form.excerpt.length}/300 characters`}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Publication Date"
                      id="date"
                      name="date"
                      value={form.date}
                      onChange={handleField}
                      placeholder="January 10, 2026"
                      error={errors.date}
                      required
                      accent="tech"
                    />

                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">
                        Estimated Reading Time
                      </label>

                      <input
                        value={form.readingTime || "Calculated while writing"}
                        readOnly
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-base text-sm text-ink-secondary"
                      />
                      <p className="text-xs text-ink-muted mt-1">
                        Automatically calculated from article content.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Tags"
                      id="tags"
                      name="tags"
                      value={form.tags}
                      onChange={handleField}
                      placeholder="react, node, javascript"
                      accent="tech"
                      hint="Separate tags with commas."
                    />

                    <Input
                      label="Technology Stack"
                      id="stack"
                      name="stack"
                      value={form.stack}
                      onChange={handleField}
                      placeholder="React, Express, MongoDB"
                      accent="tech"
                      hint="Technologies used in this article."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Difficulty Level"
                      id="difficulty"
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleField}
                      accent="tech"
                    >
                      {DIFFICULTIES.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </Select>

                    {user?.role === "admin" && (
                      <label className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={form.featured}
                          onChange={handleField}
                          className="w-4 h-4 accent-tech"
                        />

                        <span>
                          <span className="block text-sm font-medium text-ink">
                            Featured Article
                          </span>
                          <span className="block text-xs text-ink-muted">
                            Display in homepage spotlight.
                          </span>
                        </span>
                      </label>
                    )}
                  </div>

                </div>
              </Card>

              {/* Writing area */}
              <Card title="Write Your Article">
                {/* <div className="mb-4">
                  <p className="text-sm text-ink-secondary">
                    Use the toolbar to format your content. You don't need
                    to manually create individual content blocks anymore.
                  </p>
                </div> */}

                <RichTextEditor
                  key={isEdit ? id : "new-tech-blog"}
                  initialContent={editorContent}
                  onChange={handleEditorChange}
                />

                {errors.content && (
                  <p className="text-sm text-danger mt-3">
                    {errors.content}
                  </p>
                )}
              </Card>
            </>
          ) : (
            /* Preview */
            <Card title="Article Preview">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-tech mb-3">
                    Technical Article
                  </p>

                  <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
                    {form.title || "Untitled Article"}
                  </h1>

                  <p className="text-ink-secondary leading-relaxed">
                    {form.excerpt || "Your article description will appear here."}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {parseTags(form.tags).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-tech-light text-tech-dark text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-ink-muted mt-4">
                    {form.date} · {form.readingTime || "Reading time pending"}
                  </div>
                </div>

                <RichTextEditor
                  key="tech-blog-preview"
                  initialContent={editorContent}
                  editable={false}
                />
              </div>
            </Card>
          )}

          {/* Footer actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(returnUrl)}
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Cancel
            </Button>

            <div className="flex gap-2">
              {preview && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPreview(false)}
                >
                  Back to Editor
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading
                  ? isEdit ? "Saving..." : "Publishing..."
                  : isEdit ? "Save Changes" : "Publish Article"}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </PageWrapper>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-tech" />
        <h2 className="font-semibold text-sm text-ink">{title}</h2>
      </div>

      <div className="p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}
