import React, { useState, useEffect } from "react";
import Navbar from "../components/Home/Navbar";
import LoginModal from "../components/Home/LoginModal";
import SignupModal from "../components/Home/SignupModal";
import Footer from "../components/Home/Footer";
import { useNavigate } from "react-router-dom";
import http, { genApi, techApi } from "../api";



/* ── Mock blog posts ── */
// const POSTS =  [
//   {
//     id: 1,
//     title: "Building Scalable REST APIs with Node.js",
//     excerpt: "Learn how to design and build production-ready REST APIs using Express, MongoDB, and best practices that scale to millions of users.",
//     author: "Arjun Sharma",
//     avatar: "A",
//     date: "Jan 15, 2025",
//     readTime: "8 min read",
//     tags: ["Node.js", "API"],
//     color: "violet",
//   },
//   {
//     id: 2,
//     title: "React 19 — Everything You Need to Know",
//     excerpt: "Concurrent rendering, new hooks, and performance improvements. A complete breakdown of what changed and how to migrate your existing projects.",
//     author: "Ambika Girmaji",
//     avatar: "A",
//     date: "Jan 12, 2025",
//     readTime: "12 min read",
//     tags: ["React", "JavaScript"],
//     color: "pink",
//   },
//   {
//     id: 3,
//     title: "My Journey from Junior to Senior Dev in 3 Years",
//     excerpt: "The mindset shifts, the mistakes, the wins. An honest reflection on what it actually takes to level up as a software developer.",
//     author: "Rohit Verma",
//     avatar: "R",
//     date: "Jan 10, 2025",
//     readTime: "6 min read",
//     tags: ["Career", "Personal"],
//     color: "cyan",
//   },
//   {
//     id: 4,
//     title: "Docker + Node.js: The Complete Guide",
//     excerpt: "Containerize your Node.js applications like a pro. From Dockerfile to docker-compose, everything covered with real examples.",
//     author: "Sneha Patel",
//     avatar: "S",
//     date: "Jan 8, 2025",
//     readTime: "10 min read",
//     tags: ["Docker", "DevOps"],
//     color: "violet",
//   },
//   {
//     id: 5,
//     title: "Why I Quit My 9-5 to Build in Public",
//     excerpt: "Six months ago I left a comfortable job to build my own products. Here's what happened — the good, the bad, and the terrifying.",
//     author: "Vikram Das",
//     avatar: "V",
//     date: "Jan 5, 2025",
//     readTime: "5 min read",
//     tags: ["Startup", "Life"],
//     color: "pink",
//   },
//   {
//     id: 6,
//     title: "Tailwind CSS Tips That Will Change Your Workflow",
//     excerpt: "Advanced patterns, custom utilities, and tricks that experienced Tailwind developers use every day but rarely talk about.",
//     author: "Ananya Singh",
//     avatar: "A",
//     date: "Jan 2, 2025",
//     readTime: "7 min read",
//     tags: ["CSS", "Frontend"],
//     color: "cyan",
//   },
// ];

const STATS = [
  { value: "50K+", label: "Readers Monthly" },
  { value: "1.2K+", label: "Articles Published" },
  { value: "300+", label: "Expert Authors" },
  { value: "4.9★", label: "Reader Rating" },
];

const CATEGORIES = [
  { name: "Technology", count: 234, emoji: "⚡", color: "violet" },
  { name: "Career", count: 156, emoji: "🚀", color: "pink" },
  { name: "JavaScript", count: 312, emoji: "🟨", color: "cyan" },
  { name: "DevOps", count: 98, emoji: "🐳", color: "violet" },
  { name: "Personal", count: 187, emoji: "✍️", color: "pink" },
  { name: "Open Source", count: 143, emoji: "🌍", color: "cyan" },
];

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [POSTS, setPOSTS] = useState([]);
  const [Blogs,setBlogs]=useState([])
  const navigate = useNavigate();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    techApi.getAll(1,6)
      .then((r) => {
        const d = r.data.data;

        setPOSTS(d.data);
        setTotalPages(d.totalPages);
        setTotalBlogs(d.totalBlogs);
        setHasNextPage(d.hasNextPage);
        setHasPreviousPage(d.hasPreviousPage);
      })
      .catch(() => { console.log("Using demo data.", "info"); })
    // .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
      genApi.getAll(1,6)
        .then((r) => {
          const d = r.data.data;
  
          setBlogs(d.data);
          setTotalPages(d.totalPages);
          setTotalBlogs(d.totalBlogs);
          setHasNextPage(d.hasNextPage);
          setHasPreviousPage(d.hasPreviousPage);
        })
        .catch(() => { console.log("Using demo data.", "info"); })
        // .finally(() => setLoading(false));
    }, []);
    

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) return;

    try {
      await http.post("/api/subscribe", {
        email,
      });

      setSubDone(true);
      setEmail("");

      setTimeout(() => {
        setSubDone(false);
      }, 4000);
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900 font-sans overflow-x-hidden">

      {/* Navbar */}
      <Navbar
        scrolled={scrolled}
        onLogin={() => setLoginOpen(true)}
        onSignup={() => setSignupOpen(true)}
      />

      {/* ════ HERO ════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#7c3aed 1px,transparent 1px),linear-gradient(90deg,#7c3aed 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — Text */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-300 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-violet-700 text-sm font-semibold">✦ The Developer's Writing Platform</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                  <span className="text-gray-900">Spread</span>{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                    Your
                  </span>
                </h1>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-gray-900">
                  Thoughts.
                </h1>
                <h2 className="text-2xl sm:text-3xl font-bold mt-4">
                  <span className="text-gray-500">We </span>
                  <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">believe</span>
                  <span className="text-gray-500"> in your</span>
                </h2>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge!</h2>
              </div>

              <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                A free platform where developers share what they know — tutorials, career stories, opinions, and everything in between. Read. Write. Grow.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4">
                <button onClick={() => naviagte('/admin')}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-base shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_30px_rgba(124,58,237,0.5)] hover:scale-[1.03] transition-all duration-200">
                  Start Writing Free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <a href="#posts"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-base bg-white hover:bg-gray-50 hover:border-violet-300 transition-all duration-200 shadow-sm">
                  Browse Posts
                </a>
              </div>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-6 pt-2">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Floating card illustration */}
            <div className="hidden lg:flex items-center justify-center relative h-[500px]">
              {/* Main card */}
              <div className="absolute bg-white/90 backdrop-blur-xl border border-violet-200 rounded-3xl p-6 w-80 shadow-[0_8px_40px_rgba(124,58,237,0.12)]" style={{ top: "10%", left: "10%" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white">A</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Arjun Sharma</p>
                    <p className="text-xs text-gray-400">8 min read · Jan 2025</p>
                  </div>
                </div>
                <h3 className="text-gray-900 font-bold text-sm leading-snug mb-2">Building Scalable REST APIs with Node.js</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">Learn how to design production-ready APIs that scale to millions...</p>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-violet-100 text-violet-700 border border-violet-200 font-medium">Node.js</span>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-pink-100 text-pink-700 border border-pink-200 font-medium">API</span>
                </div>
              </div>

              {/* Second floating card */}
              <div className="absolute bg-white/90 backdrop-blur-xl border border-cyan-200 rounded-2xl p-4 w-56 shadow-[0_8px_30px_rgba(6,182,212,0.12)]" style={{ bottom: "15%", right: "5%" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-xs text-white">AG</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Ambika Girmaji</p>
                    <p className="text-[10px] text-gray-400">5 min read</p>
                  </div>
                </div>
                <p className="text-gray-900 font-bold text-xs leading-snug">React 19 — Everything You Need to Know</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">React</span>
                </div>
              </div>

              {/* Stats floating pill */}
              <div className="absolute bg-white border border-violet-200 rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(124,58,237,0.1)]" style={{ top: "5%", right: "15%" }}>
                <p className="text-violet-700 text-xs font-semibold">📈 50K+ readers this month</p>
              </div>

              {/* Decorative dots */}
              <div className="absolute bottom-10 left-5 grid grid-cols-5 gap-2">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-300/60" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8f9fb" />
          </svg>
        </div>
      </section>

      {/* ════ ABOUT ════ */}
      <section className="py-20 bg-[#f8f9fb]" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-4 py-2">
                <span className="text-violet-700 text-sm font-bold">About BlogCMS</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                A Platform Built <br />
                <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">For Developers</span>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed">
                We provide a free and user-friendly platform to create and read blogs. Whether you're writing a technical deep-dive or sharing your personal journey, we've got the tools for it.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "⚡", text: "Write once, reach thousands of developers instantly" },
                  { icon: "🌍", text: "Share your knowledge across the global dev community" },
                  { icon: "📚", text: "Explore content across vast technical categories" },
                  { icon: "🔒", text: "Your content, your terms — always free to publish" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSignupOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors shadow-[0_4px_14px_rgba(124,58,237,0.3)]">
                Join the Community
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* Right */}
            <div className="relative h-96 lg:h-[480px]">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-pink-100 rounded-3xl border border-violet-200 overflow-hidden shadow-[0_8px_40px_rgba(124,58,237,0.1)]">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="text-7xl">✍️</div>
                    <p className="text-gray-900 font-bold text-xl">Write. Publish. Inspire.</p>
                    <p className="text-gray-500 text-sm">Join 300+ authors already sharing their knowledge</p>
                    {/* Code snippet decoration */}
                    <div className="bg-gray-900 rounded-xl p-4 text-left font-mono text-xs border border-gray-700 mt-4 shadow-lg">
                      <p className="text-violet-400">const <span className="text-white">blog</span> = {"{"}</p>
                      <p className="text-gray-400 pl-4">title: <span className="text-green-400">"My First Post"</span>,</p>
                      <p className="text-gray-400 pl-4">author: <span className="text-green-400">"You"</span>,</p>
                      <p className="text-gray-400 pl-4">readers: <span className="text-pink-400">50000</span></p>
                      <p className="text-violet-400">{"}"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ CATEGORIES ════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Explore Categories</h2>
            <p className="text-gray-500">Find content that matches your interests</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const colors = {
                violet: "bg-violet-50 border-violet-200 hover:border-violet-400 hover:bg-violet-100 text-violet-700",
                pink: "bg-pink-50 border-pink-200 hover:border-pink-400 hover:bg-pink-100 text-pink-700",
                cyan: "bg-cyan-50 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-100 text-cyan-700",
              };
              return (
                <button key={cat.name} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${colors[cat.color]}`}>
                  <span className="text-2xl">{cat.emoji}</span>
                  <p className="font-bold text-sm text-gray-800">{cat.name}</p>
                  <p className="text-[11px] text-gray-400">{cat.count} posts</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════ RECENT POSTS ════ */}
      <section className="py-20 bg-[#f8f9fb]" id="posts">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-2">Latest Content</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Recent Posts</h2>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-semibold transition-colors" onClick={() => navigate('/general')}>
              View all posts
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post, i) => (
              <PostCard key={post._id} post={post} featured={"tech"} />
            ))}
          </div>
          
          <div className=" mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Blogs.map((post, i) => (
              <PostCard key={post._id} post={post} featured={"general"} />
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <button className="px-6 py-3 rounded-xl border-2 border-violet-200 text-violet-600 text-sm font-bold hover:bg-violet-50 transition-colors" onClick={() => navigate('/general')}>
              View all posts →
            </button>
          </div>
        </div>
      </section>

      {/* ════ NEWSLETTER ════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-pink-500 p-8 sm:p-12 text-center shadow-[0_8px_40px_rgba(124,58,237,0.25)]">
            {/* Subtle light blobs */}
            <div className="absolute top-0 left-1/4 w-64 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-pink-300/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <p className="text-violet-100 font-bold text-sm uppercase tracking-widest mb-3">📬 Newsletter</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-violet-100 text-base mb-2">Join us to get updates on what's going on in the world!</p>
              <p className="text-violet-200/70 text-sm mb-8">The best articles right in your inbox — no spam, ever.</p>

              {subDone ? (
                <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-2xl px-8 py-4">
                  <span className="text-2xl">🎉</span>
                  <div className="text-left">
                    <p className="text-white font-bold">You're subscribed!</p>
                    <p className="text-violet-100 text-sm">Welcome to the community</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 px-5 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-violet-200 text-sm focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <button type="submit"
                    className="px-6 py-3.5 rounded-xl bg-white text-violet-700 font-bold text-sm hover:bg-violet-50 hover:scale-[1.02] transition-all shadow-lg whitespace-nowrap">
                    Subscribe →
                  </button>
                </form>
              )}
              <p className="text-violet-200/60 text-xs mt-4">Join 50,000+ readers · Unsubscribe anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onLogin={() => setLoginOpen(true)} onSignup={() => setSignupOpen(true)} />

      {/* Modals */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onSwitchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }} />
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} onSwitchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }} />
    </div>
  );
}

/* ── Post Card ── */
function PostCard({ post, featured }) {
  const colorMap = {
    violet: { tag: "bg-violet-100 text-violet-700 border-violet-200", bar: "from-violet-500 to-violet-700" },
    pink: { tag: "bg-pink-100 text-pink-700 border-pink-200", bar: "from-pink-500 to-rose-500" },
    cyan: { tag: "bg-cyan-100 text-cyan-700 border-cyan-200", bar: "from-cyan-500 to-blue-500" },
  };
  const c = colorMap[post.color] ?? colorMap.violet;
  const avatarColors = ["from-violet-500 to-pink-500", "from-pink-500 to-orange-500", "from-cyan-500 to-blue-500"];
  const avClr = avatarColors[post.id % 3];
  const navigate=useNavigate()
  return (
    <div className={`group bg-white border-2 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)] transition-all duration-300 flex flex-col shadow-sm ${featured ? "border-violet-300" : "border-gray-100"}`}>
      {/* Top color bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${c.bar}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(t => (
            <span key={t} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${c.tag}`}>{t}</span>
          ))}
          {featured && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{featured} </span>}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-3 group-hover:text-violet-700 transition-colors line-clamp-2">{post.title}</h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avClr} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
              {post.avatar}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">{post.author}</p>
              <p className="text-[10px] text-gray-400">{post.date}</p>
            </div>
          </div>
          <button className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${c.tag} hover:scale-105`}
           onClick={()=>{
              const url=featured==='tech'? `/techblog/${post.slug}`:`/general/view/${post.slug}`
              navigate(url)
          }}>
            Read more
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
