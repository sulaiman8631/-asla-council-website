import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { Job, News, TownInfo } from "../types";
import { Card, EmptyState, Spinner, StatusBadge, formatDate } from "../components/ui";

export default function Home() {
  const { t } = useTranslation();
  const [town, setTown] = useState<TownInfo | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/town"),
      api.get("/news", { params: { page: 1, limit: 4 } }),
      api.get("/jobs", { params: { status: "open" } }),
    ])
      .then(([townRes, newsRes, jobsRes]) => {
        setTown(townRes.data.data);
        setNews(newsRes.data.data.items);
        setJobs((jobsRes.data.data as Job[]).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
          {town?.logo && (
            <img src={fileUrl(town.logo)} alt={town.name} className="h-24 w-24 rounded-full border-4 border-white/40 object-cover" />
          )}
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            {t("councilName", { name: town?.name ?? "عسلة" })}
          </h1>
          {town?.tagline && <p className="max-w-2xl text-lg text-brand-50">{town.tagline}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/about" className="rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
              {t("home.learnAbout")}
            </Link>
            <Link to="/news" className="rounded-xl border border-white/60 px-6 py-3 font-semibold hover:bg-white/10">
              {t("home.latestNews")}
            </Link>
          </div>
        </div>
      </section>

      {town?.statistics && town.statistics.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {town.statistics
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((stat) => (
                <Card key={stat.id} className="px-4 py-6 text-center">
                  <p className="text-2xl font-bold text-brand-700">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </Card>
              ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{t("home.latestNews")}</h2>
          <Link to="/news" className="text-sm font-semibold text-brand-700 hover:underline">
            {t("home.viewAllNews")}
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : news.length === 0 ? (
          <EmptyState message={t("home.noNews")} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.id}`}>
                <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {item.coverImage ? (
                      <img src={fileUrl(item.coverImage)} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">{t("common.noImage")}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-400">{formatDate(item.publishedAt)}</p>
                    <h3 className="mt-1 line-clamp-2 font-semibold text-slate-800">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.body}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {!loading && jobs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">{t("home.jobListings")}</h2>
            <Link to="/jobs" className="text-sm font-semibold text-brand-700 hover:underline">
              {t("home.viewAllJobs")}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <Link key={job.id} to="/jobs">
                <Card className="flex items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-sm">
                    وظ
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 line-clamp-1">{job.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {job.type && <span className="me-3">{job.type}</span>}
                      {t("home.deadlineLabel", { date: formatDate(job.deadline) })}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/jobs" className="group shadow-card rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card-hover">
            <p className="text-lg font-bold text-slate-800 group-hover:text-brand-700">{t("home.jobsTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("home.jobsDesc")}</p>
          </Link>
          <Link to="/tenders" className="group shadow-card rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card-hover">
            <p className="text-lg font-bold text-slate-800 group-hover:text-brand-700">{t("home.tendersTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("home.tendersDesc")}</p>
          </Link>
          <Link to="/reports" className="group shadow-card rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card-hover">
            <p className="text-lg font-bold text-slate-800 group-hover:text-brand-700">{t("home.reportsTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("home.reportsDesc")}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
