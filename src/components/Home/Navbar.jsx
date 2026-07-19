import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth";

export default function Navbar({ scrolled, onLogin, onSignup }) {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user,         setUser]         = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);

  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  /* ── Check if user already logged in ── */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setAuthLoading(false); return; }

    authService.getMe()
      .then(res => setUser(res.data.user))
      .catch(()  => {
        localStorage.removeItem("accessToken");
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ── Logout ── */
  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setDropdownOpen(false);
      navigate("/");
    }
  }

  /* ── Avatar initials ── */
  function getInitials(name = "") {
    return name
      .split(" ")
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ── Logo ── */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-[0_2px_10px_rgba(124,58,237,0.4)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              BLOG-<span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">CMS</span>
            </span>
          </div>

          {/* ── Desktop Right Side ── */}
          <div className="hidden md:flex items-center gap-3">
            {authLoading ? (
              <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />

            ) : user ? (
              /* ── LOGGED IN — Avatar + Dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-sm font-black shadow-[0_2px_8px_rgba(124,58,237,0.3)] flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800 leading-none">{user.name.split(" ")[0]}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{user.role}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* ── Dropdown ── */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50">

                    {/* User header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-pink-50 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1.5">
                      <DropdownItem icon={<ProfileIcon />} label="My Profile"
                        onClick={() => { navigate("/profile"); setDropdownOpen(false); }} />

                      <DropdownItem icon={<PostsIcon />} label="My Posts"
                        onClick={() => { navigate("/my-posts"); setDropdownOpen(false); }} />

                      {user.role === "admin" && (
                        <DropdownItem icon={<DashboardIcon />} label="Admin Dashboard"
                          onClick={() => { navigate("/admin"); setDropdownOpen(false); }} accent />
                      )}

                      <div className="h-px bg-gray-100 my-1.5 mx-3" />

                      <DropdownItem icon={<LogoutIcon />} label="Logout"
                        onClick={handleLogout} danger />
                    </div>
                  </div>
                )}
              </div>

            ) : (
              /* ── NOT LOGGED IN ── */
              <>
                <button onClick={onLogin}
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all">
                  Login
                </button>
                <button onClick={onSignup}
                  className="text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 hover:scale-[1.03] transition-all shadow-[0_2px_12px_rgba(124,58,237,0.35)]">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button onClick={() => setMenuOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-700">
            {menuOpen
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" /></svg>}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {user ? (
              <>
                {/* Mobile user info */}
                <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl mb-2 border border-violet-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <MobileMenuItem icon={<ProfileIcon />}   label="My Profile"       onClick={() => { navigate("/profile");   setMenuOpen(false); }} />
                <MobileMenuItem icon={<PostsIcon />}     label="My Posts"         onClick={() => { navigate("/my-posts"); setMenuOpen(false); }} />
                {user.role === "admin" && (
                  <MobileMenuItem icon={<DashboardIcon />} label="Admin Dashboard" onClick={() => { navigate("/admin");     setMenuOpen(false); }} accent />
                )}
                <div className="h-px bg-gray-200 my-2" />
                <MobileMenuItem icon={<LogoutIcon />}    label="Logout"           onClick={() => { handleLogout(); setMenuOpen(false); }} danger />
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={() => { setMenuOpen(false); onLogin(); }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-gray-800 border-2 border-gray-200 hover:bg-gray-50 transition-all">
                  Login
                </button>
                <button onClick={() => { setMenuOpen(false); onSignup(); }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 transition-all shadow-[0_2px_10px_rgba(124,58,237,0.3)]">
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Reusable Dropdown Item ── */
function DropdownItem({ icon, label, onClick, danger, accent }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
        danger  ? "text-red-500 hover:bg-red-50"
        : accent ? "text-violet-600 hover:bg-violet-50 font-semibold"
        : "text-gray-700 hover:bg-gray-50"
      }`}>
      <span className={`flex-shrink-0 ${danger ? "text-red-400" : accent ? "text-violet-500" : "text-gray-400"}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

/* ── Reusable Mobile Menu Item ── */
function MobileMenuItem({ icon, label, onClick, danger, accent }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        danger  ? "text-red-500 hover:bg-red-50"
        : accent ? "text-violet-600 hover:bg-violet-50"
        : "text-gray-700 hover:bg-gray-50"
      }`}>
      <span className={`flex-shrink-0 ${danger ? "text-red-400" : accent ? "text-violet-500" : "text-gray-400"}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

/* ── Icons ── */
function ProfileIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function PostsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13" strokeLinecap="round"/><line x1="9" y1="17" x2="13" y2="17" strokeLinecap="round"/></svg>;
}
function DashboardIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round"/></svg>;
}