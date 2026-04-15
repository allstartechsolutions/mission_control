"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-lg border border-gray-300 bg-white">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} className="project-rich-editor text-sm text-gray-700" />
    </div>
  );
}
