import React from "react";
import { motion } from "framer-motion";

const V = {
  primary:   "bg-tech text-white border-tech-dark hover:bg-tech-dark shadow-sm",
  sky:       "bg-gen text-white border-gen-dark hover:bg-gen-dark shadow-sm",
  secondary: "bg-white text-ink border-border hover:bg-surface-hover shadow-sm",
  danger:    "bg-danger-light text-danger border-danger-border hover:bg-red-100",
  ghost:     "bg-transparent text-ink-secondary border-transparent hover:bg-surface-hover",
};
const S = { sm:"px-3 py-1.5 text-xs gap-1.5", md:"px-4 py-2 text-sm gap-2", lg:"px-5 py-2.5 text-sm gap-2" };

export default function Button({ variant="primary", size="md", loading, disabled, icon, children, className="", ...p }) {
  const off = disabled || loading;
  return (
    <motion.button whileHover={!off?{scale:1.015}:{}} whileTap={!off?{scale:0.985}:{}}
      disabled={off}
      className={`inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${V[variant]??V.secondary} ${S[size]} ${className}`}
      {...p}
    >
      {loading
        ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        : icon ? <span className="flex-shrink-0">{icon}</span> : null}
      {children}
    </motion.button>
  );
}
