import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";

export default function MyProfile() {
  const navigate = useNavigate();

  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("profile"); // "profile" | "password"

  // Profile form
  const [form,        setForm]        = useState({ name: "", bio: "", avatar: "" });
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [saveErr,     setSaveErr]     = useState("");

  // Password form
  const [passForm,    setPassForm]    = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPass,    setShowPass]    = useState({ current: false, new: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg,     setPassMsg]     = useState("");
  const [passErr,     setPassErr]     = useState("");

  /* ── Fetch user ── */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { navigate("/"); return; }

    authService.getMe()
      .then(res => {
        const u = res.data.user;
        setUser(u);
        setForm({ name: u.name || "", bio: u.bio || "", avatar: u.avatar || "" });
      })
      .catch(() => { localStorage.removeItem("accessToken"); navigate("/"); })
      .finally(() => setLoading(false));
  }, []);

  /* ── Update profile ── */
  async function handleProfileSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setSaveErr("Name is required."); return; }
    setSaving(true); setSaveErr(""); setSaveMsg("");
    try {
      const res = await authService.updateProfile({ name: form.name, bio: form.bio, avatar: form.avatar });
      setUser(res.data.user);
      setSaveMsg("Profile updated successfully! ✓");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveErr(err.response?.data?.message ?? "Failed to update profile.");
    } finally { setSaving(false); }
  }

  /* ── Change password ── */
  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) { setPassErr("All fields are required."); return; }
    if (passForm.newPassword.length < 6) { setPassErr("New password must be at least 6 characters."); return; }
    if (passForm.newPassword !== passForm.confirm) { setPassErr("Passwords don't match."); return; }
    setPassLoading(true); setPassErr(""); setPassMsg("");
    try {
      await authService.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassMsg("Password changed successfully! ✓");
      setPassForm({ currentPassword: "", newPassword: "", confirm: "" });
      setTimeout(() => setPassMsg(""), 3000);
    } catch (err) {
      setPassErr(err.response?.data?.message ?? "Failed to change password.");
    } finally { setPassLoading(false); }
  }

  function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  }

  const strength = passForm.newPassword.length === 0 ? 0 : passForm.newPassword.length < 4 ? 1 : passForm.newPassword.length < 7 ? 2 : passForm.newPassword.length < 10 ? 3 : 4;
  const strengthLabel = ["", "Too weak", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">

      {/* ── Top banner ── */}
      <div className="h-36 sm:h-48 bg-gradient-to-r from-violet-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute top-4 left-4 sm:left-8">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 pb-16">

        {/* ── Profile Card Header ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                  onError={e => { e.target.style.display = "none"; }} />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-lg">
                  {getInitials(user?.name)}
                </div>
              )}
              <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white ${user?.isVerified ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${user?.role === "admin" ? "bg-violet-100 text-violet-700 border border-violet-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                  {user?.role === "admin" ? "⚡ Admin" : "👤 User"}
                </span>
                {user?.isVerified && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
                <span className="text-[11px] text-gray-400">
                  Joined {new Date(user?.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
              {user?.bio && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{user.bio}</p>}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
          {[
            { key: "profile",  label: "Edit Profile",    icon: <PenIcon /> },
            { key: "password", label: "Change Password", icon: <LockIcon /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* ── Edit Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-600 to-pink-500" />
              <h2 className="font-bold text-gray-900">Edit Profile</h2>
            </div>
            <form onSubmit={handleProfileSave} className="p-5 sm:p-6 space-y-5">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name <span className="text-violet-500">*</span>
                </label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Avatar URL</label>
                <input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" />
                {/* Avatar preview */}
                {form.avatar && (
                  <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <img src={form.avatar} alt="preview"
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      onError={e => { e.target.src = ""; e.target.style.display = "none"; }} />
                    <p className="text-xs text-gray-500">Avatar preview</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">Bio</label>
                  <span className="text-xs text-gray-400">{form.bio.length}/300</span>
                </div>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  maxLength={300} rows={4}
                  placeholder="Tell the world a little about yourself..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all resize-none leading-relaxed" />
              </div>

              {/* Read-only email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 border border-gray-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400 flex-shrink-0">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-sm text-gray-500">{user?.email}</span>
                  <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Cannot change</span>
                </div>
              </div>

              {/* Messages */}
              {saveMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-500 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-emerald-700 text-sm font-medium">{saveMsg}</p>
                </div>
              )}
              {saveErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-red-500 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  <p className="text-red-600 text-sm font-medium">{saveErr}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setForm({ name: user?.name || "", bio: user?.bio || "", avatar: user?.avatar || "" })}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-all">
                  Reset
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 transition-all shadow-[0_2px_10px_rgba(124,58,237,0.3)] disabled:opacity-60 flex items-center gap-2">
                  {saving ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Change Password Tab ── */}
        {activeTab === "password" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-600 to-pink-500" />
              <h2 className="font-bold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordSave} className="p-5 sm:p-6 space-y-5">

              {/* Current Password */}
              <PasswordInput
                label="Current Password"
                value={passForm.currentPassword}
                show={showPass.current}
                onToggle={() => setShowPass(s => ({ ...s, current: !s.current }))}
                onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />

              {/* New Password */}
              <div className="space-y-1.5">
                <PasswordInput
                  label="New Password"
                  value={passForm.newPassword}
                  show={showPass.new}
                  onToggle={() => setShowPass(s => ({ ...s, new: !s.new }))}
                  onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                />
                {passForm.newPassword && (
                  <div className="space-y-1 mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-orange-500" : strength === 3 ? "text-yellow-600" : "text-green-600"}`}>
                      {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <PasswordInput
                  label="Confirm New Password"
                  value={passForm.confirm}
                  show={showPass.confirm}
                  onToggle={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                  onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  error={passForm.confirm && passForm.confirm !== passForm.newPassword}
                  success={passForm.confirm && passForm.confirm === passForm.newPassword}
                />
                {passForm.confirm && passForm.confirm !== passForm.newPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/></svg>
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Security tip */}
              <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
                </svg>
                <p className="text-xs text-violet-700 leading-relaxed">
                  Use a strong password with letters, numbers and symbols. Don't reuse passwords from other sites.
                </p>
              </div>

              {/* Messages */}
              {passMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-500 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-emerald-700 text-sm font-medium">{passMsg}</p>
                </div>
              )}
              {passErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-red-500 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
                  </svg>
                  <p className="text-red-600 text-sm font-medium">{passErr}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={passLoading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 transition-all shadow-[0_2px_10px_rgba(124,58,237,0.3)] disabled:opacity-60 flex items-center gap-2">
                  {passLoading ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Updating…</>
                  ) : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Password Input ── */
function PasswordInput({ label, value, show, onToggle, onChange, placeholder, error, success }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 border text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            error   ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
            : success ? "border-green-400 focus:border-green-400 focus:ring-green-400/20"
            : "border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
          }`} />
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
      </div>
    </div>
  );
}

/* ── Icons ── */
function PenIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function LockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>; }

/* ── Loading Screen ── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="h-36 sm:h-48 bg-gradient-to-r from-violet-600 to-pink-500" />
      <div className="max-w-3xl mx-auto px-4 -mt-16 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="flex gap-4 items-end">
            <div className="w-24 h-24 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-2 pb-2">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
        <div className="h-12 bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-gray-200 animate-pulse" />
      </div>
    </div>
  );
}