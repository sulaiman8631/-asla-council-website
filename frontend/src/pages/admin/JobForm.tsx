import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { Card, ErrorBox, Spinner } from "../../components/ui";
import FileUpload from "../../components/admin/FileUpload";

interface FormState {
  title: string;
  description: string;
  requirements: string;
  type: string;
  location: string;
  deadline: string;
  status: "open" | "closed";
  attachment: string | null;
}

const initial: FormState = {
  title: "",
  description: "",
  requirements: "",
  type: "",
  location: "عسلة",
  deadline: "",
  status: "open",
  attachment: null,
};

function toDateInput(value: string) {
  return value ? value.slice(0, 10) : "";
}

export default function JobForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/jobs/${id}`)
      .then((res) => {
        const j = res.data.data;
        setForm({
          title: j.title,
          description: j.description,
          requirements: j.requirements ?? "",
          type: j.type ?? "",
          location: j.location,
          deadline: toDateInput(j.deadline),
          status: j.status,
          attachment: j.attachment,
        });
      })
      .catch(() => setError("تعذر تحميل بيانات الإعلان"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements || null,
        type: form.type || null,
        location: form.location,
        deadline: form.deadline,
        status: form.status,
        attachment: form.attachment,
      };
      if (isEdit) await api.put(`/jobs/${id}`, payload);
      else await api.post("/jobs", payload);
      navigate("/admin/jobs");
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر حفظ الإعلان الوظيفي");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/jobs" className="text-sm font-semibold text-brand-700 hover:underline">→ الوظائف</Link>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "تعديل إعلان وظيفي" : "إعلان وظيفي جديد"}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">العنوان *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الوصف *</label>
            <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">المتطلبات</label>
            <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">نوع الدوام</label>
              <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="دوام كامل / جزئي / مؤقت"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">الموقع</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">آخر موعد للتقديم *</label>
              <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "open" | "closed" })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none">
                <option value="open">مفتوح</option>
                <option value="closed">مغلق</option>
              </select>
            </div>
          </div>

          <FileUpload label="ملف الإعلان (PDF) - اختياري" value={form.attachment} onChange={(url) => setForm({ ...form, attachment: url })} accept="application/pdf" preview="none" />

          {error && <ErrorBox message={error} />}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
            <Link to="/admin/jobs" className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50">إلغاء</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
