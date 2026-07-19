import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

export default function DeleteModal({ isOpen, title, onConfirm, onCancel, loading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onCancel} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{opacity:0,scale:0.92,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92}}
              transition={{type:"spring",stiffness:380,damping:28}}
              className="bg-white rounded-2xl border border-border shadow-modal p-6 w-full max-w-sm pointer-events-auto"
            >
              <div className="w-11 h-11 rounded-xl bg-danger-light border border-danger-border flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-danger">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-center font-semibold text-ink mb-1.5">Delete Post</h3>
              <p className="text-center text-sm text-ink-secondary mb-5 leading-relaxed">
                Delete <span className="font-medium text-ink">"{truncate(title,40)}"</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>Delete</Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
function truncate(s="",n){return s.length<=n?s:s.slice(0,n)+"…";}
