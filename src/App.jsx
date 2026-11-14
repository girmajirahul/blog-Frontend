import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar, { MobileNav } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ToastContainer } from "./components/Toast";
import { useToast } from "./hooks/useToast";
import PageWrapper from "./components/PageWrapper";

import Dashboard from "./pages/Dashboard";
import TechBlogForm from "./pages/tech/TechBlogForm";
import TechBlogList from "./pages/tech/TechBlogList";
import GeneralBlogForm from "./pages/general/GeneralBlogForm";
import GeneralBlogList from "./pages/general/GeneralBlogList";
import Home from "./pages/Home";
import GeneralBlog from "./pages/general/GeneralblogDetail";
import TechBlogDetail from "./pages/tech/TechBlogDetail";
import MyProfile from "./pages/MyProfile";
import MyPosts from "./pages/MyPosts";
import TechBlogList2 from "./pages/TechBlogList2";
import AuthCallback from "./pages/AuthCallback";
import BlogList from "./pages/CommonBlogList";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndCondition";
import CookiePolicy from "./pages/legal/CookieAndPolicy";
import ProtectedRoute from "./components/auth/ProtectedRoutes";
import Unauthorized from "./pages/Unauthorized";
import ChatPage from "./pages/chatPage";

function Layout({ children, onToast }) {
  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ onToast }} />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default function App() {
  const { toasts, add, remove } = useToast();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/general/view/:slug" element={<GeneralBlog />} />
        <Route path="/techblog/:slug" element={<TechBlogDetail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />


        {/* <Route path="/my-posts" element={<MyPosts />} /> */}
        <Route path="/general" element={<TechBlogList2 />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/general/create" element={<GeneralBlogForm />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/general/create" element={<GeneralBlogForm />} />
          <Route path="/general/edit/:id" element={<GeneralBlogForm />} />
          <Route path="/tech/create" element={<TechBlogForm />} />
          <Route path="/tech/edit/:id" element={<TechBlogForm />} />
        </Route>


        {/*Admin  Dashboard */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/admin/tech" element={<TechBlogList />} />
            <Route path="/admin/tech/create" element={<TechBlogForm />} />
            <Route path="/admin/tech/edit/:id" element={<TechBlogForm />} />

            {/* General Blog */}
            <Route path="/admin/general" element={< GeneralBlogList />} />
            <Route path="/admin/general/create" element={<GeneralBlogForm />} />
            <Route path="/admin/general/edit/:id" element={<GeneralBlogForm />} />
          </Route>

        </Route>




        {/* 404 */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen bg-surface-base text-center">
            <p className="text-6xl font-bold text-tech mb-3">404</p>
            <p className="text-ink-secondary mb-6">Page not found</p>
            <a href="/" className="text-sm text-tech hover:text-tech-dark font-medium underline">Go to Home</a>
          </div>
        } />
      </Routes>

      <ToastContainer toasts={toasts} remove={remove} />
    </BrowserRouter>
  );
}
