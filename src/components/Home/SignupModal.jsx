import React, { useState, useEffect } from "react";
import { authService } from "../../api/auth";

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = form, 2 = success

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; setError(""); setForm({ name: "", email: "", password: "", confirm: "" }); setStep(1); }
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  function validate() {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    return "";
  }

  // function handleSubmit(e) {
  //   e.preventDefault();
  //   const err = validate();
  //   if (err) { setError(err); return; }
  //   setLoading(true);
  //   setTimeout(() => { setLoading(false); setStep(2); }, 1400);
  // }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    try {
      const res = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      // Token save karo
      localStorage.setItem("accessToken", res.data.accessToken);
      // Success screen dikhao
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message ?? "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }


  const strength = form.password.length === 0 ? 0 : form.password.length < 4 ? 1 : form.password.length < 7 ? 2 : form.password.length < 10 ? 3 : 4;
  const strengthLabel = ["", "Too weak", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400" />

        <div className="p-7 sm:p-8">
          {step === 2 ? (
            /* ── Success screen ── */
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-10 h-10"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">You're in! 🎉</h2>
              <p className="text-gray-500 text-sm mb-1">Welcome to Blogin, <span className="text-violet-600 font-bold">{form.name}</span>!</p>
              <p className="text-gray-400 text-xs mb-7">Your account has been created successfully.</p>
              <button onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-sm hover:opacity-90 transition-all shadow-[0_4px_14px_rgba(124,58,237,0.3)]">
                Start Exploring →
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Join Blog-CMS ✨</h2>
                  <p className="text-sm text-gray-500 mt-1">Create your free account today</p>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="Tony Stark"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="tony@stark.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input name="password" type={show ? "text" : "password"} value={form.password} onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" />
                    <button type="button" onClick={() => setShow(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {show
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" /></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-orange-500" : strength === 3 ? "text-yellow-600" : "text-green-600"}`}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                    placeholder="Repeat your password"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all focus:bg-white ${form.confirm && form.confirm !== form.password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                      : form.confirm && form.confirm === form.password
                        ? "border-green-400 focus:border-green-400 focus:ring-green-400/20"
                        : "border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                      }`} />
                  {form.confirm && form.confirm !== form.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
                      Passwords don't match
                    </p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" required className="mt-1 w-4 h-4 rounded accent-violet-600 cursor-pointer flex-shrink-0" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I agree to the{" "}
                    <span className="text-violet-600 hover:text-violet-700 font-semibold cursor-pointer">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-violet-600 hover:text-violet-700 font-semibold cursor-pointer">Privacy Policy</span>
                  </p>
                </label>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-red-500 flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
                    <p className="text-red-600 text-xs font-medium">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-sm hover:opacity-90 hover:scale-[1.01] transition-all shadow-[0_4px_14px_rgba(124,58,237,0.3)] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account…</>
                  ) : "Create Free Account 🚀"}
                </button>
              </form>

              <div className="flex items-center gap-3 mt-5 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or with google</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google */}
              <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all mb-5 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Sign up with Google
              </button>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <button onClick={onSwitchToLogin} className="text-violet-600 hover:text-violet-700 font-bold transition-colors">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
