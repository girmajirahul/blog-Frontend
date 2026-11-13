
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  ImagePlus,
  Minus,
  Undo2,
  Redo2,
  Code2,
} from "lucide-react";

const lowlight = createLowlight(common);

export default function RichTextEditor({
  initialContent,
  onChange,
  editable = true,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),

      CodeBlockLowlight.configure({
        lowlight,
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
      }),

      Placeholder.configure({
        placeholder:
          "Start writing your technical blog... Type your thoughts here.",
      }),
    ],

    content: initialContent || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },

    editable,

    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },

    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] px-5 py-6 focus:outline-none text-ink",
      },
    },
  });

  if (!editor) return null;

  function addImage() {
    const src = window.prompt("Enter image URL:");

    if (!src) return;

    const alt = window.prompt("Enter image description (alt text):") || "";

    editor.chain().focus().setImage({ src, alt }).run();
  }

  if (!editable) {
    return (
      <div className="rounded-xl border border-border bg-white p-4">
        <EditorContent editor={editor} />
      </div>
    );
  }

  const toolbar = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      icon: Heading2,
      label: "Heading",
      action: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote / callout",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      icon: Code,
      label: "Inline code",
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    {
      icon: Code2,
      label: "Code block",
      action: () =>
        editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    {
      icon: Minus,
      label: "Divider",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      active: false,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface-base">
        {toolbar.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onClick={item.action}
              className={`p-2 rounded-lg transition-colors ${
                item.active
                  ? "bg-tech text-white"
                  : "text-ink-secondary hover:bg-surface-hover"
              }`}
            >
              <Icon size={17} />
            </button>
          );
        })}

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          title="Insert image"
          onClick={addImage}
          className="p-2 rounded-lg text-ink-secondary hover:bg-surface-hover"
        >
          <ImagePlus size={17} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-ink-secondary hover:bg-surface-hover disabled:opacity-30"
        >
          <Undo2 size={17} />
        </button>

        <button
          type="button"
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-ink-secondary hover:bg-surface-hover disabled:opacity-30"
        >
          <Redo2 size={17} />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <div className="px-4 py-2 border-t border-border bg-surface-base flex justify-between">
        <span className="text-xs text-ink-muted">
          Write naturally. Use the toolbar to format your content.
        </span>

        <span className="text-xs text-ink-muted">
          Markdown shortcuts supported
        </span>
      </div>
    </div>
  );
}
