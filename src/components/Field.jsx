import React from "react";

const base = "w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:bg-surface-hover";

export function Field({ label, id, error, hint, required, children, className="" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}{required && <span className="text-tech ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ label, id, error, hint, required, className="", accent="tech", ...p }) {
  const ring = accent === "sky" ? "focus:border-gen focus:ring-2 focus:ring-gen/20" : "focus:border-tech focus:ring-2 focus:ring-tech/20";
  return (
    <Field label={label} id={id} error={error} hint={hint} required={required} className={className}>
      <input id={id} className={`${base} ${error ? "border-danger" : "border-border hover:border-border-strong"} ${ring}`} {...p} />
    </Field>
  );
}

export function Textarea({ label, id, error, hint, required, rows=5, className="", accent="tech", ...p }) {
  const ring = accent === "sky" ? "focus:border-gen focus:ring-2 focus:ring-gen/20" : "focus:border-tech focus:ring-2 focus:ring-tech/20";
  return (
    <Field label={label} id={id} error={error} hint={hint} required={required} className={className}>
      <textarea id={id} rows={rows} className={`${base} resize-y font-mono leading-relaxed ${error ? "border-danger" : "border-border hover:border-border-strong"} ${ring}`} {...p} />
    </Field>
  );
}

export function Select({ label, id, error, hint, required, className="", accent="tech", children, ...p }) {
  const ring = accent === "sky" ? "focus:border-gen focus:ring-2 focus:ring-gen/20" : "focus:border-tech focus:ring-2 focus:ring-tech/20";
  return (
    <Field label={label} id={id} error={error} hint={hint} required={required} className={className}>
      <select id={id} className={`${base} cursor-pointer ${error ? "border-danger" : "border-border hover:border-border-strong"} ${ring}`} {...p}>{children}</select>
    </Field>
  );
}
