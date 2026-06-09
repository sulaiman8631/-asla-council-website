import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Star, X } from "lucide-react";
import api, { fileUrl } from "../../lib/api";
import type { Category, NewsImage } from "../../types";
import { Card, ErrorBox, Spinner } from "../../components/ui";

interface ImageEntry {
  url: string;
  isMain: boolean;
  sortOrder: number;
}

interface FormState {
  title: string;
  body: string;
  categoryId: string;
  isPublished: boolean;
  images: ImageEntry[];
}

const emptyForm: FormState = { title: "", body: "", categoryId: "", isPublished: true, images: [] };

function toEntry(img: NewsImage): ImageEntry {
  return { url: img.url, isMain: img.isMain, sortOrder: img.sortOrder };
}

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/categories", { params: { kind: "news" } }).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/news/${id}/edit`)
      .then((res) => {
        const n = res.data.data;
        setForm({
          title: n.title,
          body: n.body,
          categoryId: n.categoryId ? String(n.categoryId) : "",
          isPublished: n.isPublished,
          images: (n.images ?? []).map(toEntry),
        });
      })
      .catch(() => setError("تعذر تحميل بيانات الخبر"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleImageFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    const uploaded: ImageEntry[] = [];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push({ url: res.data.data.url, isMain: false, sortOrder: 0 });
      } catch {
        // skip failed file, continue with others
      }
    }
    if (!uploaded.length) {
      setUploadError("تعذر رفع الصور المحددة");
      setUploading(false);
      return;
    }
    setForm((prev) => {
      const combined = [...prev.images, ...uploaded].map((img, i) => ({ ...img, sortOrder: i }));
      const hasMain = combined.some((img) => img.isMain);
      if (!hasMain && combined.length > 0) combined[0] = { ...combined[0], isMain: true };
      return { ...prev, images: combined };
    });
    setUploading(false);
  }

  function setMain(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isMain: i === index })),
    }));
  }

  function removeImage(index: number) {
    setForm((prev) => {
      const wasMain = prev.images[index].isMain;
      const remaining = prev.images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i }));
      if (wasMain && remaining.length > 0) remaining[0] = { ...remaining[0], isMain: true };
      return { ...prev, images: remaining };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        body: form.body,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        isPublished: form.isPublished,
        images: form.images,
      };
      if (isEdit) {
        await api.put(`/news/${id}`, payload);
      } else {
        await api.post("/news", payload);
      }
      navigate("/admin/news");
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر حفظ الخبر");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/news" className="text-sm font-semibold text-brand-700 hover:underline">→ الأخبار</Link>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "تعديل خبر" : "خبر جديد"}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">العنوان *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">نص الخبر *</label>
            <textarea
              required
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">التصنيف</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            >
              <option value="">بدون تصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Multi-image uploader */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              الصور
              {form.images.length > 0 && (
                <span className="mr-2 text-xs font-normal text-slate-400">
                  الصورة المميزة بالنجمة هي صورة الغلاف
                </span>
              )}
            </label>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((img, i) => (
                <div
                  key={img.url + i}
                  className={`relative overflow-hidden rounded-xl border-2 ${
                    img.isMain ? "border-brand-500" : "border-slate-200"
                  }`}
                >
                  <img
                    src={fileUrl(img.url)}
                    alt=""
                    className="h-24 w-full object-cover"
                  />

                  {/* Main badge */}
                  {img.isMain && (
                    <div className="absolute right-1 top-1 rounded-full bg-brand-500 p-0.5">
                      <Star className="h-3 w-3 fill-white text-white" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 px-1.5 py-1">
                    {!img.isMain ? (
                      <button
                        type="button"
                        title="تعيين كصورة رئيسية"
                        onClick={() => setMain(i)}
                        className="flex items-center gap-0.5 rounded text-xs text-yellow-300 hover:text-yellow-100"
                      >
                        <Star className="h-3 w-3" />
                        <span>رئيسية</span>
                      </button>
                    ) : (
                      <span className="text-xs text-yellow-300">رئيسية</span>
                    )}
                    <button
                      type="button"
                      title="حذف الصورة"
                      onClick={() => removeImage(i)}
                      className="rounded p-0.5 text-red-300 hover:text-red-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add button */}
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                disabled={uploading}
                className="flex h-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span className="mt-1 text-xs">{uploading ? "جارٍ الرفع..." : "إضافة صورة"}</span>
              </button>
            </div>

            {uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}

            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleImageFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            نشر الخبر فورًا
          </label>

          {error && <ErrorBox message={error} />}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
            <Link to="/admin/news" className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50">
              إلغاء
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
