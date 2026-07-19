import React from "react";

export default function Footer({ onLogin, onSignup }) {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-[0_2px_10px_rgba(124,58,237,0.3)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl font-black text-gray-900">BLOG-<span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">CMS</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Spread your thoughts! We believe in your knowledge. Do you?
            </p>
            {/* Social icons */}
            
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "Posts", "About", "Contact"].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-violet-600 transition-colors font-medium flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-violet-500 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            {/* <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">More</h3>
            <ul className="space-y-3">
              {["FAQ's", "Documentation", "API", "Changelog"].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-violet-600 transition-colors font-medium flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-violet-500 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul> */}
          </div>

          {/* Get the App */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Get Started</h3>
            <div className="space-y-3">
              <button onClick={onSignup}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-all shadow-[0_2px_10px_rgba(124,58,237,0.25)]">
                Create Free Account
              </button>
              <button onClick={onLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-white border-2 border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                Sign In
              </button>
              {/* App stores */}
              {/* <div className="space-y-2 pt-1">
                {[
                  { store: "Google Play", icon: "▶" },
                  { store: "App Store",   icon: "🍎" },
                ].map(app => (
                  <button key={app.store}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                    <span className="text-base">{app.icon}</span>
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 leading-none">Download on</p>
                      <p className="text-xs font-bold text-gray-800">{app.store}</p>
                    </div>
                  </button>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2025 Blogin. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms", "Cookies"].map(item => (
              <a key={item} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
