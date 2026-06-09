import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ErrorBox } from "../../components/ui";

export default function Login() {
  const { admin, login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-l from-brand-700 to-brand-500 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-brand-700">دخول لوحة الإدارة</h1>
        <p className="mt-1 text-center text-sm text-slate-500">مجلس قروي عسلة</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">اسم المستخدم</label>
            <input
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <Link to="/" className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
