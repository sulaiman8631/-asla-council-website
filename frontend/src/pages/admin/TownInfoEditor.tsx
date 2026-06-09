import { useEffect, useState, type FormEvent } from "react";
import api from "../../lib/api";
import { Card, ErrorBox, Spinner } from "../../components/ui";
import FileUpload from "../../components/admin/FileUpload";

interface StatRow {
  label: string;
  value: string;
}

interface FormState {
  name: string;
  tagline: string;
  about: string;
  history: string;
  population: string;
  area: string;
  established: string;
  mayorName: string;
  logo: string | null;
  statistics: StatRow[];
}

const initial: FormState = {
  name: "",
  tagline: "",
  about: "",
  history: "",
  population: "",
  area: "",
  established: "",
  mayorName: "",
  logo: null,
  statistics: [],
};

export default function TownInfoEditor() {
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/town")
      .then((res) => {
        const t = res.data.data;
        setForm({
          name: t.name ?? "",
          tagline: t.tagline ?? "",
          about: t.about ?? "",
          history: t.history ?? "",
          population: t.population != null ? String(t.population) : "",
          area: t.area ?? "",
          established: t.established ?? "",
          mayorName: t.mayorName ?? "",
          logo: t.logo,
          statistics: (t.statistics ?? []).map((s: any) => ({ label: s.label, value: s.value })),
        });
      })
      .catch(() => setError("تعذر تحميل معلومات البلدة"))
      .finally(() => setLoading(false));
  }, []);

  function updateStat(idx: number, field: keyof StatRow, value: string) {
    setForm((f) => ({
      ...f,
      statistics: f.statistics.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  function addStat() {
    setForm((f) => ({ ...f, statistics: [...f.statistics, { label: "", value: "" }] }));
  }

  function removeStat(idx: number) {
    setForm((f) => ({ ...f, statistics: f.statistics.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline || null,
        about: form.about || null,
        history: form.history || null,
        population: form.population ? Number(form.population) : null,
        area: form.area || null,
        established: form.established || null,
        mayorName: form.mayorName || null,
        logo: form.logo,
        statistics: form.statistics
          .filter((s) => s.label.trim() && s.value.trim())
          .map((s, idx) => ({ ...s, sortOrder: idx })),
      };
      const res = await api.put("/town", payload);
      setSuccess(res.data.message || "تم الحفظ بنجاح");
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر حفظ معلومات البلدة");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">معلومات البلدة</h1>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">اسم البلدة *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">الشعار النصي (Tagline)</label>
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">نبذة عن البلدة</label>
            <textarea rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">لمحة تاريخية</label>
            <textarea rows={4} value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">عدد السكان</label>
              <input type="number" value={form.population} onChange={(e) => setForm({ ...form, population: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">المساحة</label>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">سنة التأسيس</label>
              <input value={form.established} onChange={(e) => setForm({ ...form, established: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">رئيس المجلس</label>
              <input value={form.mayorName} onChange={(e) => setForm({ ...form, mayorName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <FileUpload label="شعار البلدة" value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} accept="image/*" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">إحصائيات إضافية (بطاقات الصفحة الرئيسية)</label>
              <button type="button" onClick={addStat} className="text-sm font-semibold text-brand-700 hover:underline">+ إضافة بطاقة</button>
            </div>
            <div className="space-y-2">
              {form.statistics.map((stat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input value={stat.label} onChange={(e) => updateStat(idx, "label", e.target.value)} placeholder="التسمية (مثال: عدد السكان)"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                  <input value={stat.value} onChange={(e) => updateStat(idx, "value", e.target.value)} placeholder="القيمة"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                  <button type="button" onClick={() => removeStat(idx)} className="rounded-lg border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50">حذف</button>
                </div>
              ))}
            </div>
          </div>

          {error && <ErrorBox message={error} />}
          {success && <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{success}</p>}

          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </Card>
    </div>
  );
}
