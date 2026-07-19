# Blog CMS — Admin Dashboard

A clean, light-themed admin dashboard for managing two separate blog types.

## Quick Start

```bash
npm install
cp .env.example .env      # set VITE_API_BASE=http://localhost:5000
npm run dev               # → http://localhost:3000
```

## Two Blog Types

### Tech Blog  →  /api/tech
Schema: `slug, title, excerpt, date, readingTime, tags, stack, featured, difficulty, content[blocks]`

Content blocks: `paragraph · heading · bullet · numbered · code · callout · image · divider`

### General Blog  →  /api/blogs
Schema: `slug, title, excerpt, date, readingTime, tags, coverImage, content[String]`

Content: simple array of paragraph strings.

## Project Structure

```
src/
├── api/index.js                  ← techApi + genApi (Axios)
├── components/
│   ├── Sidebar.jsx               ← Collapsible desktop + mobile bottom nav
│   ├── Topbar.jsx                ← Breadcrumbs
│   ├── Button.jsx                ← primary / sky / secondary / danger / ghost
│   ├── Field.jsx                 ← Input / Textarea / Select
│   ├── Toast.jsx                 ← Notifications
│   ├── DeleteModal.jsx           ← Confirm dialog
│   └── PageWrapper.jsx           ← Fade-in wrapper
├── hooks/useToast.js
├── pages/
│   ├── Dashboard.jsx             ← Overview of both blog types
│   ├── tech/
│   │   ├── TechBlogForm.jsx      ← Create / Edit with content block builder
│   │   └── TechBlogList.jsx      ← All tech blogs with search + filter
│   └── general/
│       ├── GeneralBlogForm.jsx   ← Create / Edit with paragraph builder + preview
│       └── GeneralBlogList.jsx   ← All general blogs card grid
├── utils/helpers.js
└── App.jsx
```

## Build

```bash
npm run build    # → dist/
npm run preview  # preview locally
```
