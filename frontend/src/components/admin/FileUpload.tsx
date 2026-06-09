import { useRef, useState } from "react";
import api, { fileUrl } from "../../lib/api";

interface Props {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  preview?: "image" | "none";
}

export default function FileUpload({ label, value, onChange, accept = "image/*", preview = "image" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.data.url);
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر رفع الملف");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {uploading ? "جارٍ الرفع..." : value ? "استبدال الملف" : "اختيار ملف"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            إزالة
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {value && preview === "image" && (
        <img src={fileUrl(value)} alt="" className="mt-2 h-32 w-32 rounded-lg border border-slate-200 object-cover" />
      )}
      {value && preview === "none" && (
        <a href={fileUrl(value)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
          عرض الملف الحالي
        </a>
      )}
    </div>
  );
}
