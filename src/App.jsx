import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function Layout({ children, onToast }) {
  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {React.cloneElement(children, { onToast })}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  const { toasts, add, remove } = useToast();

  const w = (El) => (
    <Layout onToast={add}>
      <El />
    </Layout>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/general/view/:slug" element={<GeneralBlog />} />
        <Route path="/techblog/:slug" element={<TechBlogDetail />} />

        <Route path="/profile" element={<MyProfile />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/general" element={<TechBlogList2/>} />

        {/* Dashboard */}
        <Route path="/admin" element={w(Dashboard)} />

        {/* Tech Blog */}
        <Route path="/admin/tech" element={w(TechBlogList)} />
        <Route path="/admin/tech/create" element={w(TechBlogForm)} />
        <Route path="/admin/tech/edit/:id" element={w(TechBlogForm)} />

        {/* General Blog */}
        <Route path="/admin/general" element={w(GeneralBlogList)} />
        <Route path="/admin/general/create" element={w(GeneralBlogForm)} />
        <Route path="/admin/general/edit/:id" element={w(GeneralBlogForm)} />

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
