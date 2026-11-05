"use client"

import { useCallback, useEffect, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import { Markdown } from "tiptap-markdown"
import {
  FiBold,
  FiCode,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiUnderline,
} from "react-icons/fi"
import { LuHeading2, LuHeading3, LuListOrdered, LuQuote } from "react-icons/lu"

type Props = {
  value: string
  onChange: (markdown: string) => void
  disabled?: boolean
}

function getMarkdown(editor: { storage: unknown }): string {
  const storage = editor.storage as {
    markdown?: { getMarkdown?: () => string }
  }
  return storage.markdown?.getMarkdown?.() ?? ""
}

async function uploadBlogImage(file: File): Promise<string> {
  const body = new FormData()
  body.append("file", file)
  body.append("folder", "blog")
  const res = await fetch("/api/upload", { method: "POST", body })
  const data = await res.json()
  if (!data.success || !data.imageUrl) {
    throw new Error(data.error || "Upload failed")
  }
  return data.imageUrl as string
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition ${
        active
          ? "bg-violet-600 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

export function BlogMarkdownEditor({ value, onChange, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const uploading = useRef(false)
  // Avoid feedback loops when syncing external value
  const lastEmitted = useRef(value)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "blog-code-block" } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "blog-editor-image" },
      }),
      Placeholder.configure({
        placeholder: "Write your post… Use the toolbar for headings, lists, links, and images.",
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "blog-md-editor min-h-[420px] max-h-[70vh] overflow-y-auto px-4 py-3 text-[15px] leading-relaxed text-white focus:outline-none scrollbar-modern",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false
        const file = event.dataTransfer.files[0]
        if (!file?.type.startsWith("image/")) return false
        event.preventDefault()
        void (async () => {
          try {
            const url = await uploadBlogImage(file)
            const { schema } = view.state
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })
            if (!coordinates || !schema.nodes.image) return
            const node = schema.nodes.image.create({ src: url })
            const tx = view.state.tr.insert(coordinates.pos, node)
            view.dispatch(tx)
          } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : "Image upload failed")
          }
        })()
        return true
      },
      handlePaste: (_view, event) => {
        const file = event.clipboardData?.files?.[0]
        if (!file?.type.startsWith("image/")) return false
        event.preventDefault()
        void (async () => {
          try {
            const url = await uploadBlogImage(file)
            editor?.chain().focus().setImage({ src: url }).run()
          } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : "Image upload failed")
          }
        })()
        return true
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = getMarkdown(ed)
      lastEmitted.current = md
      onChange(md)
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    if (value === lastEmitted.current) return
    // External reset (e.g. loaded post) — replace content without fighting typing
    const current = getMarkdown(editor)
    if (current === value) {
      lastEmitted.current = value
      return
    }
    editor.commands.setContent(value || "")
    lastEmitted.current = value
  }, [editor, value])

  const insertImage = useCallback(async (file: File) => {
    if (!editor || uploading.current) return
    uploading.current = true
    try {
      const url = await uploadBlogImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed")
    } finally {
      uploading.current = false
    }
  }, [editor])

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", prev || "https://")
    if (url === null) return
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run()
  }

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-8 text-sm text-gray-400">
        Loading editor…
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-800 px-2 py-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FiBold />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FiItalic />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FiUnderline />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={editor.isActive("code")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <FiCode />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-700" />

        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <LuHeading2 />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <LuHeading3 />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FiList />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <LuListOrdered />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <LuQuote />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-700" />

        <ToolbarButton label="Link" active={editor.isActive("link")} disabled={disabled} onClick={setLink}>
          <FiLink />
        </ToolbarButton>
        <ToolbarButton
          label="Insert image"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        >
          <FiImage />
        </ToolbarButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void insertImage(file)
            e.target.value = ""
          }}
        />
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .blog-md-editor p {
          margin: 0.65em 0;
        }
        .blog-md-editor h2 {
          margin: 1.1em 0 0.4em;
          font-size: 1.35rem;
          font-weight: 700;
          color: #fff;
        }
        .blog-md-editor h3 {
          margin: 1em 0 0.35em;
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
        }
        .blog-md-editor ul {
          list-style: disc;
          padding-left: 1.35em;
          margin: 0.6em 0;
        }
        .blog-md-editor ol {
          list-style: decimal;
          padding-left: 1.35em;
          margin: 0.6em 0;
        }
        .blog-md-editor blockquote {
          border-left: 2px solid rgba(167, 139, 250, 0.5);
          padding-left: 0.9em;
          color: rgba(255, 255, 255, 0.65);
          font-style: italic;
          margin: 0.8em 0;
        }
        .blog-md-editor code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.9em;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1em 0.35em;
          border-radius: 4px;
        }
        .blog-md-editor pre {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem 1rem;
          overflow-x: auto;
          margin: 0.85em 0;
          border-radius: 6px;
        }
        .blog-md-editor pre code {
          background: transparent;
          padding: 0;
        }
        .blog-md-editor a {
          color: #c4b5fd;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-md-editor img.blog-editor-image,
        .blog-md-editor img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 4px;
        }
        .blog-md-editor p.is-editor-empty:first-child::before {
          color: rgba(156, 163, 175, 0.75);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
