'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

type Props = {
  initialContent: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[220px] px-4 py-3 text-sm leading-relaxed',
      },
    },
  })

  if (!editor) return null

  const toolBtn = (active: boolean, disabled = false) =>
    `w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors
    ${disabled ? 'opacity-30 cursor-default' :
      active ? 'bg-yellow-400 text-stone-900' : 'text-gray-600 hover:bg-gray-100'}`

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
        <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={toolBtn(editor.isActive('bold'))}>
          <strong>B</strong>
        </button>
        <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolBtn(editor.isActive('italic'))}>
          <em>I</em>
        </button>
        <button type="button" title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolBtn(editor.isActive('underline'))}>
          <u>U</u>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button type="button" title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolBtn(editor.isActive('bulletList'))}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="2" cy="3.5" r="1" fill="currentColor" stroke="none"/>
            <circle cx="2" cy="7" r="1" fill="currentColor" stroke="none"/>
            <circle cx="2" cy="10.5" r="1" fill="currentColor" stroke="none"/>
            <line x1="5" y1="3.5" x2="13" y2="3.5"/>
            <line x1="5" y1="7" x2="13" y2="7"/>
            <line x1="5" y1="10.5" x2="13" y2="10.5"/>
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={toolBtn(false, !editor.can().undo())}>
          ↩
        </button>
        <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={toolBtn(false, !editor.can().redo())}>
          ↪
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
