import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import type { Category } from "../../types";
import { Card, ErrorBox, Spinner } from "../../components/ui";
import FileUpload from "../../components/admin/FileUpload";

interface FormState {
  title: string;
  description: string;
  file: string | null;
  categoryId: string;
  year: string;
}

const initial: FormState = { title: "", description: "", file: null, categoryId: "", year: "" };

export default function ReportForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initial);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories", { params: { kind: "report" } }).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/reports/${id}`)
      .then((res) => {
        const r = res.data.data;
        setForm({
          title: r.title,
          description: r.description ?? "",
          file: r.file,
          categoryId: r.categoryId ? String(r.categoryId) : "",
          year: r.year ? String(r.year) : "",
        });
      })
      .catch(() => setError("تعذر تحميل بيانات التقرير"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.file) {
      setError("يجب رفع ملف التقرير (PDF)");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        file: form.file,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        year: form.year ? Number(form.year) : null,
      };
      if (isEdit) await api.put(`/reports/${id}`, payload);
      else await api.post("/reports", payload);
      navigate("/admin/reports");
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر حفظ التقرير");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/reports" className="text-sm font-semibold text-brand-700 hover:underline">→ التقارير</Link>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "تعديل تقرير" : "تقرير جديد"}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">العنوان *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الوصف</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">التصنيف</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none">
                <option value="">بدون تصنيف</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">السنة</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <FileUpload label="ملف التقرير (PDF) *" value={form.file} onChange={(url) => setForm({ ...form, file: url })} accept="application/pdf" preview="none" />

          {error && <ErrorBox message={error} />}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
            <Link to="/admin/reports" className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50">إلغاء</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
