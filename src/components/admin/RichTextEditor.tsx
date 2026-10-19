"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Underline, Undo2, Unlink } from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/MediaPicker";
import { isSafeHref } from "@/lib/url-safety";

/**
 * WYSIWYG editor for CMS rich text. Output HTML is sanitised again on the server when saved and rendered,
 * so only an allow-listed set of tags/attributes can ever reach the public site.
 */
export function RichTextEditor({ value, onChange, label, id }: { value: string; onChange: (html: string) => void; label: string; id?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, protocols: ["mailto", "tel"] } }),
      Image.configure({ inline: false }),
    ],
    content: value || "<p></p>",
    editorProps: { attributes: { class: "a-prose min-h-[220px] px-3 py-2", "aria-label": label, role: "textbox", "aria-multiline": "true", ...(id ? { id } : {}) } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep external resets (e.g. switching sections) in sync.
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
          }
        : null,
  });

  if (!editor) return <div className="a-input min-h-[260px] animate-pulse bg-zinc-50" />;

  const btn = (active: boolean | undefined, onClick: () => void, title: string, Icon: React.ComponentType<{ className?: string }>) => (
    <button type="button" title={title} aria-label={title} aria-pressed={active} onClick={onClick} className={`rounded p-1.5 ${active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-200"}`}>
      <Icon className="h-4 w-4" />
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL (https://…, /page, mailto: or tel:)", prev ?? "https://");
    if (href === null) return;
    if (!href) return editor.chain().focus().unsetLink().run();
    if (!isSafeHref(href)) return window.alert("That link is not allowed. Use https://, a site path like /contact, mailto: or tel:.");
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className="rounded-lg border border-zinc-300 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 p-1" role="toolbar" aria-label={`${label} formatting`}>
        {btn(state?.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Heading", Heading2)}
        {btn(state?.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Subheading", Heading3)}
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        {btn(state?.bold, () => editor.chain().focus().toggleBold().run(), "Bold", Bold)}
        {btn(state?.italic, () => editor.chain().focus().toggleItalic().run(), "Italic", Italic)}
        {btn(state?.underline, () => editor.chain().focus().toggleUnderline().run(), "Underline", Underline)}
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        {btn(state?.ul, () => editor.chain().focus().toggleBulletList().run(), "Bulleted list", List)}
        {btn(state?.ol, () => editor.chain().focus().toggleOrderedList().run(), "Numbered list", ListOrdered)}
        {btn(state?.quote, () => editor.chain().focus().toggleBlockquote().run(), "Quote", Quote)}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), "Divider", Minus)}
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        {btn(state?.link, setLink, "Add link", Link2)}
        {state?.link && btn(false, () => editor.chain().focus().unsetLink().run(), "Remove link", Unlink)}
        {btn(false, () => setPickerOpen(true), "Insert image from media library", ImagePlus)}
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        {btn(false, () => editor.chain().focus().undo().run(), "Undo", Undo2)}
        {btn(false, () => editor.chain().focus().redo().run(), "Redo", Redo2)}
      </div>
      <EditorContent editor={editor} />
      <MediaPickerDialog
        open={pickerOpen}
        kind="IMAGE"
        onClose={() => setPickerOpen(false)}
        onSelect={(items) => {
          const m = items[0];
          if (m && m.kind === "IMAGE") editor.chain().focus().setImage({ src: m.url, alt: m.alt }).run();
        }}
      />
    </div>
  );
}

export function RichTextField({ form, name, label, help }: { form: { values: Record<string, unknown>; set: (n: string, v: unknown) => void; errors: Record<string, string> }; name: string; label: string; help?: string }) {
  return (
    <div>
      <p className="a-label">{label}</p>
      <RichTextEditor value={String(form.values[name] ?? "")} onChange={(html) => form.set(name, html)} label={label} />
      {help && <p className="a-help">{help}</p>}
      {form.errors[name] && <p className="a-error">{form.errors[name]}</p>}
    </div>
  );
}
