import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CFG = {
  success: { bg:"bg-success-light border-success-border", icon:"✓", iconCls:"bg-success text-white" },
  error:   { bg:"bg-danger-light border-danger-border",   icon:"✕", iconCls:"bg-danger text-white"   },
  info:    { bg:"bg-tech-light border-tech-border",       icon:"i", iconCls:"bg-tech text-white"      },
};

function Toast({ message, type="info", onClose, duration=4500 }) {
  const c = CFG[type] ?? CFG.info;
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity:0, y:16, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:8, scale:0.96 }}
      transition={{ type:"spring", stiffness:380, damping:28 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-modal w-80 max-w-[calc(100vw-2rem)] ${c.bg}`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${c.iconCls}`}>{c.icon}</span>
      <p className="text-sm text-ink flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>{toasts.map(t => <Toast key={t.id} {...t} onClose={() => remove(t.id)} />)}</AnimatePresence>
    </div>
  );
}
