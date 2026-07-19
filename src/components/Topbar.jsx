import React from "react";
import { Link, useLocation } from "react-router-dom";

const MAP = {
  "/admin":                [{ label:"Dashboard" }],
  "/admin/tech":           [{ label:"Dashboard", to:"/admin" }, { label:"Tech Blogs" }],
  "/admin/tech/create":    [{ label:"Tech Blogs", to:"/admin/tech" }, { label:"Create" }],
  "/admin/general":        [{ label:"Dashboard", to:"/admin" }, { label:"General Blogs" }],
  "/admin/general/create": [{ label:"General Blogs", to:"/admin/general" }, { label:"Create" }],
};
function getCrumbs(path) {
  if (MAP[path]) return MAP[path];
  if (path.startsWith("/admin/tech/edit"))    return [{ label:"Tech Blogs",    to:"/admin/tech"    }, { label:"Edit" }];
  if (path.startsWith("/admin/general/edit")) return [{ label:"General Blogs", to:"/admin/general" }, { label:"Edit" }];
  return [{ label:"Dashboard" }];
}

export default function Topbar() {
  const { pathname } = useLocation();
  const crumbs = getCrumbs(pathname);
  return (
    <header className="h-[60px] flex items-center justify-between px-4 sm:px-6 bg-white border-b border-border sticky top-0 z-30 flex-shrink-0">
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((c,i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-ink-muted">/</span>}
            {c.to
              ? <Link to={c.to} className="text-ink-muted hover:text-ink transition-colors hidden sm:inline">{c.label}</Link>
              : <span className="font-semibold text-ink">{c.label}</span>}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 bg-surface-base border border-border rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"/>
          <span className="text-xs text-ink-muted font-medium">Connected</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tech to-gen flex items-center justify-center text-xs font-bold text-white cursor-pointer">A</div>
      </div>
    </header>
  );
}
