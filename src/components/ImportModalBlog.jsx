
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  FileText,
  UploadCloud,
  CalendarDays,
  Tags,
  Image,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const ImportBlogModal = ({ isOpen, onClose, onImport }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    tags: "",
    coverImage: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = (selectedFile) => {
    setError("");

    if (!selectedFile) return;

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["docx", "txt"].includes(extension)) {
      setError("Only DOCX and TXT files are supported.");
      return;
    }

    if (selectedFile.size > 3 * 1024 * 1024) {
      setError("File size must be less than 3 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a DOCX or TXT document.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Blog title is required.");
      return;
    }

    if (!formData.date) {
      setError("Publication date is required.");
      return;
    }

    const payload = new FormData();

    payload.append("title", formData.title.trim());
    payload.append("date", formData.date);
    payload.append("tags", formData.tags);
    payload.append("coverImage", formData.coverImage.trim());
    payload.append("file", file);

    try {
      setLoading(true);

      await onImport(payload);

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to import blog. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      tags: "",
      coverImage: "",
    });

    setFile(null);
    setError("");
    setSuccess(false);

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-blog-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-violet-600 to-pink-500 px-6 py-7 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-pink-200/20 blur-3xl" />

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                aria-label="Close modal"
                className="absolute right-5 top-5 rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:opacity-50"
              >
                <X size={20} />
              </button>

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-white shadow-lg">
                  <BookOpen size={28} />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-100">
                    <Sparkles size={14} />
                    Blog Management
                  </div>

                  <h2
                    id="import-blog-title"
                    className="text-2xl font-black text-white sm:text-3xl"
                  >
                    Import New Blog
                  </h2>

                  <p className="mt-1 text-sm text-violet-100">
                    Upload your article and add its details.
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
              {success ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <CheckCircle2 size={44} />
                  </div>

                  <h3 className="text-2xl font-black text-slate-800">
                    Blog Imported Successfully!
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Your article has been uploaded and saved successfully.
                  </p>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-7 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Blog title */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Blog Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter your blog title..."
                      maxLength={200}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>

                  {/* Date and tags */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays size={16} className="text-violet-600" />
                        Publication Date *
                      </label>

                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Tags size={16} className="text-violet-600" />
                        Tags
                      </label>

                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="React, Node.js, JavaScript"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

                  {/* Cover image URL */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Image size={16} className="text-violet-600" />
                      Cover Image URL
                      <span className="font-normal text-slate-400">(Optional)</span>
                    </label>

                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://example.com/cover-image.jpg"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>

                  {/* Document upload */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Article Document <span className="text-red-500">*</span>
                    </label>

                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        handleFile(e.dataTransfer.files[0]);
                      }}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                        dragging
                          ? "border-violet-500 bg-violet-50"
                          : "border-violet-200 bg-violet-50/50 hover:border-violet-400 hover:bg-violet-50"
                      }`}
                    >
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-lg">
                        <UploadCloud size={27} />
                      </div>

                      {file ? (
                        <>
                          <p className="max-w-full break-all text-sm font-bold text-violet-700">
                            {file.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                          <span className="mt-3 text-xs font-semibold text-pink-600">
                            Click to replace document
                          </span>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-slate-700">
                            Drag and drop your document here
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            or click to browse files
                          </p>
                          <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-600 shadow-sm">
                            DOCX or TXT · Maximum 3 MB
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept=".docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          handleFile(e.target.files[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Backend generated fields note */}
                  <div className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
                    <FileText
                      size={20}
                      className="mt-0.5 shrink-0 text-violet-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-violet-800">
                        Automatic processing
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-violet-700">
                        Slug, excerpt and reading time will be generated
                        automatically by the backend using your title and
                        document content.
                      </p>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                    >
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Footer buttons */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !file}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={18} />
                          Import Blog
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportBlogModal;
