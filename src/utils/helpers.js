export function generateSlug(title) {
  return title.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr; // return as-is if already formatted
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function todayString() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function estimateReadingTime(blocks) {
  // blocks is array of content block objects (TechBlog)
  if (!Array.isArray(blocks)) return "1 min read";
  const words = blocks.reduce((acc, b) => {
    if (b.text)  acc += b.text.split(/\s+/).length;
    if (b.items) acc += b.items.join(" ").split(/\s+/).length;
    if (b.code)  acc += 10; // count code blocks as ~10 words
    return acc;
  }, 0);
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function estimateReadingTimeFromStrings(arr) {
  // arr is array of strings (General Blog)
  if (!Array.isArray(arr)) return "1 min read";
  const words = arr.join(" ").split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function parseTags(str) {
  if (!str) return [];
  return str.split(",").map(t => t.trim()).filter(Boolean);
}

export function truncate(str, max = 80) {
  if (!str) return "";
  return str.length <= max ? str : str.slice(0, max) + "…";
}

export function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
