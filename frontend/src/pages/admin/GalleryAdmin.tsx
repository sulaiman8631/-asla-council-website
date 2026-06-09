import { useEffect, useState, type FormEvent } from "react";
import api, { fileUrl } from "../../lib/api";
import type { GalleryImage } from "../../types";
import { Card, EmptyState, ErrorBox, Spinner } from "../../components/ui";
import FileUpload from "../../components/admin/FileUpload";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [url, setUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/gallery")
      .then((res) => setItems(res.data.data))
      .catch(() => setError("تعذر تحميل صور المعرض"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!url) {
      setFormError("يجب رفع صورة أولًا");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await api.post("/gallery", { url, caption: caption || null, sortOrder: items.length });
      setUrl(null);
      setCaption("");
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "تعذر إضافة الصورة");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/gallery/${toDelete.id}`);
      setToDelete(null);
      load();
    } catch {
      setError("تعذر حذف الصورة");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">إدارة معرض الصور</h1>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-slate-800">إضافة صورة جديدة</h2>
        <form onSubmit={handleAdd} className="mt-4 space-y-4">
          <FileUpload label="الصورة *" value={url} onChange={setUrl} accept="image/*" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">وصف الصورة (اختياري)</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>
          {formError && <ErrorBox message={formError} />}
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "جارٍ الإضافة..." : "إضافة الصورة"}
          </button>
        </form>
      </Card>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد صور في المعرض بعد" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <div className="aspect-square w-full overflow-hidden bg-slate-100">
                  <img src={fileUrl(img.url)} alt={img.caption ?? ""} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  {img.caption && <p className="line-clamp-1 text-sm text-slate-600">{img.caption}</p>}
                  <button type="button" onClick={() => setToDelete(img)} className="mt-1 text-sm font-medium text-red-600 hover:underline">
                    حذف
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة من المعرض؟"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
