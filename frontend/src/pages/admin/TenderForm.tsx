import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { Card, ErrorBox, Spinner } from "../../components/ui";
import FileUpload from "../../components/admin/FileUpload";

interface FormState {
  referenceNo: string;
  title: string;
  description: string;
  document: string | null;
  publishDate: string;
  deadline: string;
  status: "open" | "closed";
}

const initial: FormState = {
  referenceNo: "",
  title: "",
  description: "",
  document: null,
  publishDate: "",
  deadline: "",
  status: "open",
};

function toDateInput(value: string) {
  return value ? value.slice(0, 10) : "";
}

export default function TenderForm() {
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
      .get(`/tenders/${id}`)
      .then((res) => {
        const t = res.data.data;
        setForm({
          referenceNo: t.referenceNo,
          title: t.title,
          description: t.description ?? "",
          document: t.document,
          publishDate: toDateInput(t.publishDate),
          deadline: toDateInput(t.deadline),
          status: t.status,
        });
      })
      .catch(() => setError("تعذر تحميل بيانات العطاء"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        referenceNo: form.referenceNo,
        title: form.title,
        description: form.description || null,
        document: form.document,
        ...(form.publishDate && { publishDate: form.publishDate }),
        deadline: form.deadline,
        status: form.status,
      };
      if (isEdit) await api.put(`/tenders/${id}`, payload);
      else await api.post("/tenders", payload);
      navigate("/admin/tenders");
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر حفظ العطاء");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/tenders" className="text-sm font-semibold text-brand-700 hover:underline">→ العطاءات</Link>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "تعديل عطاء" : "عطاء جديد"}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">رقم العطاء *</label>
              <input required value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
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
              <label className="mb-1 block text-sm font-medium text-slate-700">تاريخ النشر</label>
              <input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">آخر موعد للتقديم *</label>
              <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <FileUpload label="وثيقة العطاء (PDF)" value={form.document} onChange={(url) => setForm({ ...form, document: url })} accept="application/pdf" preview="none" />

          {error && <ErrorBox message={error} />}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
            <Link to="/admin/tenders" className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50">إلغاء</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
