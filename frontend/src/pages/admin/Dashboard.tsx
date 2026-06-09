import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Card, ErrorBox, Spinner } from "../../components/ui";

interface Stats {
  news: number;
  jobs: number;
  tenders: number;
  reports: number;
  gallery: number;
  unreadMessages: number;
}

const tiles: { key: keyof Stats; label: string; to: string }[] = [
  { key: "news", label: "الأخبار", to: "/admin/news" },
  { key: "jobs", label: "الوظائف", to: "/admin/jobs" },
  { key: "tenders", label: "العطاءات", to: "/admin/tenders" },
  { key: "reports", label: "التقارير", to: "/admin/reports" },
  { key: "gallery", label: "صور المعرض", to: "/admin/gallery" },
  { key: "unreadMessages", label: "رسائل غير مقروءة", to: "/admin/messages" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(() => setError("تعذر تحميل إحصائيات لوحة التحكم"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
      <p className="mt-1 text-slate-500">نظرة عامة على محتوى موقع مجلس قروي عسلة</p>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile) => (
              <Link key={tile.key} to={tile.to}>
                <Card className="p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <p className="text-3xl font-bold text-brand-700">{stats?.[tile.key] ?? 0}</p>
                  <p className="mt-1 text-slate-500">{tile.label}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
