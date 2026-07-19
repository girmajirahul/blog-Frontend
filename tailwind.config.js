/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          base:  "#f8f9fb",
          card:  "#ffffff",
          hover: "#f1f4f8",
          muted: "#e8ecf2",
        },
        ink: {
          DEFAULT: "#1a1d23",
          secondary: "#4b5563",
          muted:     "#9ca3af",
          faint:     "#d1d5db",
        },
        tech: {
          DEFAULT:  "#6366f1",
          light:    "#eef2ff",
          border:   "#c7d2fe",
          dark:     "#4f46e5",
          muted:    "#818cf8",
        },
        gen: {
          DEFAULT:  "#0ea5e9",
          light:    "#f0f9ff",
          border:   "#bae6fd",
          dark:     "#0284c7",
          muted:    "#38bdf8",
        },
        success: { DEFAULT:"#10b981", light:"#ecfdf5", border:"#a7f3d0" },
        danger:  { DEFAULT:"#ef4444", light:"#fef2f2", border:"#fecaca" },
        warning: { DEFAULT:"#f59e0b", light:"#fffbeb", border:"#fde68a" },
        border:  { DEFAULT:"#e5e7eb", strong:"#d1d5db" },
      },
      fontFamily: {
        sans: ["Inter","system-ui","sans-serif"],
        mono: ["JetBrains Mono","Fira Code","monospace"],
      },
      boxShadow: {
        card:  "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        modal: "0 20px 60px rgba(0,0,0,0.12)",
        input: "0 0 0 3px rgba(99,102,241,0.12)",
        "input-gen": "0 0 0 3px rgba(14,165,233,0.12)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
    },
  },
  plugins: [],
};
