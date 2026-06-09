import { useEffect, useState, type FormEvent } from "react";
import api from "../../lib/api";
import { Card, ErrorBox, Spinner } from "../../components/ui";

interface FormState {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapEmbedUrl: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

const initial: FormState = {
  address: "",
  phone: "",
  email: "",
  workingHours: "",
  mapEmbedUrl: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
};

export default function ContactInfoEditor() {
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/contact-info")
      .then((res) => {
        const c = res.data.data;
        setForm({
          address: c.address ?? "",
          phone: c.phone ?? "",
          email: c.email ?? "",
          workingHours: c.workingHours ?? "",
          mapEmbedUrl: c.mapEmbedUrl ?? "",
          facebook: c.facebook ?? "",
          instagram: c.instagram ?? "",
          twitter: c.twitter ?? "",
          youtube: c.youtube ?? "",
        });
      })
      .catch(() => setError("تعذر تحميل معلومات الاتصال"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()])
      );
      const res = await api.put("/contact-info", payload);
      setSuccess(res.data.message || "تم الحفظ بنجاح");
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر حفظ معلومات الاتصال");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">معلومات الاتصال</h1>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">العنوان</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">ساعات العمل</label>
            <input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">رابط خرائط Google المضمن (iframe src)</label>
            <input value={form.mapEmbedUrl} onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
              placeholder="https://www.google.com/maps?q=...&output=embed"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left focus:border-brand-500 focus:outline-none" dir="ltr" />
            <p className="mt-1 text-xs text-slate-400">من خرائط جوجل: مشاركة ← تضمين خريطة ← انسخ رابط src من كود iframe</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">فيسبوك</label>
              <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left focus:border-brand-500 focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">انستغرام</label>
              <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left focus:border-brand-500 focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">تويتر / X</label>
              <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left focus:border-brand-500 focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">يوتيوب</label>
              <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left focus:border-brand-500 focus:outline-none" dir="ltr" />
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
