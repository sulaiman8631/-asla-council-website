import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import type { Job } from "../types";
import { Card, EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge, formatDate } from "../components/ui";

export default function Jobs() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/jobs", { params: { status: "open" } })
      .then((res) => setItems(res.data.data))
      .catch(() => setError(t("jobs.listError")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("jobs.title")} subtitle={t("jobs.subtitle")} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length === 0 ? (
          <EmptyState message={t("jobs.noJobs")} />
        ) : (
          <div className="space-y-4">
            {items.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800">
                        {job.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-slate-500">
                        {job.type && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                            {job.type}
                          </span>
                        )}
                        <span>{job.location}</span>
                        <span>{t("jobs.deadline", { date: formatDate(job.deadline) })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={job.status} />
                      <span className="text-sm font-semibold text-brand-600">{t("common.viewDetails")}</span>
                    </div>
                  </div>

                  {job.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {job.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
