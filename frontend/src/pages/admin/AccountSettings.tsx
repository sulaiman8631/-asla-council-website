import { type FormEvent, useState } from "react";
import { KeyRound, User } from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ErrorBox } from "../../components/ui";

export default function AccountSettings() {
  const { admin, updateAdmin } = useAuth();

  const [usernameForm, setUsernameForm] = useState({ currentPassword: "", username: admin?.username ?? "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [usernameMsg, setUsernameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [submittingU, setSubmittingU] = useState(false);
  const [submittingP, setSubmittingP] = useState(false);

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    setUsernameMsg(null);
    if (usernameForm.username === admin?.username) {
      setUsernameMsg({ ok: false, text: "اسم المستخدم لم يتغير" });
      return;
    }
    setSubmittingU(true);
    try {
      const res = await api.put("/auth/profile", {
        currentPassword: usernameForm.currentPassword,
        username: usernameForm.username,
      });
      updateAdmin(res.data.data);
      setUsernameMsg({ ok: true, text: "تم تغيير اسم المستخدم بنجاح" });
      setUsernameForm((f) => ({ ...f, currentPassword: "" }));
    } catch (err: any) {
      setUsernameMsg({ ok: false, text: err?.response?.data?.message ?? "حدث خطأ" });
    } finally {
      setSubmittingU(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ ok: false, text: "كلمة المرور الجديدة وتأكيدها غير متطابقتين" });
      return;
    }
    setSubmittingP(true);
    try {
      await api.put("/auth/profile", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordMsg({ ok: false, text: err?.response?.data?.message ?? "حدث خطأ" });
    } finally {
      setSubmittingP(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">إعدادات الحساب</h1>
        <p className="mt-1 text-sm text-slate-500">تعديل بيانات حساب المسؤول</p>
      </div>

      {/* Current account info */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
          {admin?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{admin?.username}</p>
          <p className="text-sm text-slate-500">{admin?.role === "admin" ? "مسؤول النظام" : admin?.role}</p>
        </div>
      </div>

      {/* Change username */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-slate-800">تغيير اسم المستخدم</h2>
        </div>
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>اسم المستخدم الجديد</label>
            <input required value={usernameForm.username} onChange={(e) => setUsernameForm((f) => ({ ...f, username: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>كلمة المرور الحالية (للتأكيد)</label>
            <input required type="password" value={usernameForm.currentPassword} onChange={(e) => setUsernameForm((f) => ({ ...f, currentPassword: e.target.value }))} className={inputCls} />
          </div>
          {usernameMsg && (
            usernameMsg.ok
              ? <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{usernameMsg.text}</p>
              : <ErrorBox message={usernameMsg.text} />
          )}
          <button type="submit" disabled={submittingU} className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {submittingU ? "جارٍ الحفظ..." : "حفظ اسم المستخدم"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-slate-800">تغيير كلمة المرور</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>كلمة المرور الحالية</label>
            <input required type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>كلمة المرور الجديدة</label>
            <input required type="password" minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} className={inputCls} />
            <p className="mt-1 text-xs text-slate-400">6 أحرف على الأقل</p>
          </div>
          <div>
            <label className={labelCls}>تأكيد كلمة المرور الجديدة</label>
            <input required type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} className={inputCls} />
          </div>
          {passwordMsg && (
            passwordMsg.ok
              ? <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{passwordMsg.text}</p>
              : <ErrorBox message={passwordMsg.text} />
          )}
          <button type="submit" disabled={submittingP} className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {submittingP ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
}
