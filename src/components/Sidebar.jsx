import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  {
    section: "Overview",
    items: [
      { path:"/admin",        label:"Dashboard",  exact:true,
        icon:<GridIcon /> },
    ],
  },
  {
    section: "Tech Blogs",
    accent: "tech",
    items: [
      { path:"/admin/tech/create", label:"Create Tech Blog",
        icon:<PlusIcon /> },
      { path:"/admin/tech",        label:"All Tech Blogs",
        icon:<ListIcon /> },
    ],
  },
  {
    section: "General Blogs",
    accent: "gen",
    items: [
      { path:"/admin/general/create", label:"Create General Blog",
        icon:<PlusIcon /> },
      { path:"/admin/general",        label:"All General Blogs",
        icon:<ListIcon /> },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  function isActive(item) {
    return item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration:0.25, ease:"easeInOut" }}
      className="hidden md:flex flex-col h-screen bg-white border-r border-border flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border min-h-[60px]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tech to-gen flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:"auto"}} exit={{opacity:0,width:0}} className="overflow-hidden">
              <p className="text-sm font-bold text-ink whitespace-nowrap">Blog<span className="text-tech">CMS</span></p>
              <p className="text-[10px] text-ink-muted whitespace-nowrap">Admin Dashboard</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV.map((group) => (
          <div key={group.section} className="mb-2">
            {!collapsed && (
              <p className={`text-[10px] font-bold uppercase tracking-widest px-2 mb-1 ${
                group.accent === "tech" ? "text-tech-muted" :
                group.accent === "gen"  ? "text-gen-muted"  : "text-ink-muted"
              }`}>
                {group.section}
              </p>
            )}
            {group.items.map(item => {
              const active = isActive(item);
              const isTech = group.accent === "tech";
              const isGen  = group.accent === "gen";
              return (
                <NavLink key={item.path} to={item.path} title={collapsed ? item.label : ""}
                  className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? isTech ? "bg-tech-light text-tech-dark"
                        : isGen ? "bg-gen-light text-gen-dark"
                        : "bg-surface-hover text-ink"
                      : "text-ink-secondary hover:bg-surface-hover hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span layoutId={`pill-${group.section}`}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r ${isTech?"bg-tech":isGen?"bg-gen":"bg-ink"}`}
                      transition={{type:"spring",stiffness:400,damping:30}}
                    />
                  )}
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="whitespace-nowrap text-[13px]">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-hover cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-tech to-gen flex items-center justify-center text-xs font-bold text-white flex-shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">Admin</p>
              <p className="text-[10px] text-ink-muted truncate">admin@blog.dev</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(c=>!c)}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-hover transition-all text-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
            className={`w-4 h-4 transition-transform duration-300 ${collapsed?"rotate-180":""}`}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}

/* Mobile bottom nav */
export function MobileNav() {
  const location = useLocation();
  const flat = NAV.flatMap(g => g.items);
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border flex justify-around px-1 py-2">
      {flat.map(item => {
        const active = item.exact ? location.pathname===item.path : location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.path} to={item.path}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all text-[9px] font-medium ${active?"text-tech":"text-ink-muted"}`}>
            <span className={active?"scale-110":""} style={{transition:"transform 0.15s"}}>{item.icon}</span>
            {item.label.split(" ")[0]}
          </NavLink>
        );
      })}
    </nav>
  );
}

/* Icons */
function GridIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>; }
function ListIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path d="M4 6h16M4 10h16M4 14h10M4 18h7" strokeLinecap="round"/></svg>; }
