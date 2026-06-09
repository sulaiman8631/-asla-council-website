import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { Report } from "../types";
import { Card, EmptyState, ErrorBox, PageHeader, Spinner, formatDate } from "../components/ui";

export default function Reports() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/reports", { params: year ? { year } : {} })
      .then((res) => setItems(res.data.data))
      .catch(() => setError(t("reports.listError")))
      .finally(() => setLoading(false));
  }, [year]);

  const years = useMemo(() => {
    const set = new Set<number>();
    items.forEach((r) => r.year && set.add(r.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, Report[]>();
    for (const r of items) {
      const key = r.category?.name ?? t("reports.general");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [items, t]);

  return (
    <div>
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")} />

      <div className="mx-auto max-w-5xl px-4 py-10">
        {years.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">{t("common.filterByYear")}</span>
            <button
              type="button"
              onClick={() => setYear("")}
              className={`rounded-full px-3 py-1 text-sm ${year === "" ? "bg-brand-600 text-white" : "border border-slate-300 text-slate-600"}`}
            >
              {t("common.all")}
            </button>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(String(y))}
                className={`rounded-full px-3 py-1 text-sm ${year === String(y) ? "bg-brand-600 text-white" : "border border-slate-300 text-slate-600"}`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length === 0 ? (
          <EmptyState message={t("reports.noReports")} />
        ) : (
          <div className="space-y-8">
            {grouped.map(([category, reports]) => (
              <div key={category}>
                <h2 className="mb-3 text-lg font-bold text-slate-800">{category}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-5">
                      <h3 className="font-semibold text-slate-800">{report.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>{formatDate(report.publishedAt)}</span>
                        {report.year && <span>{t("reports.yearLabel", { year: report.year })}</span>}
                      </div>
                      {report.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{report.description}</p>}
                      <a
                        href={fileUrl(report.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        {t("reports.downloadBtn")}
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
