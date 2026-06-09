import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Briefcase, Mail, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { ContactInfo, Job } from "../types";
import { ErrorBox, Spinner, StatusBadge, formatDate } from "../components/ui";

export default function JobDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/jobs/${id}`), api.get("/contact-info")])
      .then(([jobRes, contactRes]) => {
        setJob(jobRes.data.data);
        setContactEmail((contactRes.data.data as ContactInfo).email ?? null);
      })
      .catch(() => setError(t("jobs.loadError")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !job) return <div className="px-4 py-10"><ErrorBox message={error || t("jobs.notFound")} /></div>;

  const isPast = new Date(job.deadline) < new Date();
  const isClosed = job.status === "closed" || isPast;

  const mailtoHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(t("jobs.emailSubject", { title: job.title }))}&body=${encodeURIComponent(t("jobs.emailBody", { title: job.title }))}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/jobs" className="text-sm font-semibold text-brand-700 hover:underline">
        {t("jobs.backToJobs")}
      </Link>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="bg-gradient-to-l from-brand-700 to-brand-600 px-6 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-snug">{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-brand-100">
                {job.type && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {job.type}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {t("jobs.deadline", { date: formatDate(job.deadline) })}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={isClosed ? "closed" : "open"} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="mb-3 text-base font-bold text-slate-800">{t("jobs.description")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">{job.description}</p>
          </div>

          {job.requirements && (
            <div className="rounded-xl bg-slate-50 p-4">
              <h2 className="mb-3 text-base font-bold text-slate-800">{t("jobs.requirements")}</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">{job.requirements}</p>
            </div>
          )}

          {job.attachment && (
            <a
              href={fileUrl(job.attachment)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              <Download className="h-4 w-4" />
              {t("jobs.downloadAd")}
            </a>
          )}

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <h2 className="mb-1 text-base font-bold text-slate-800">{t("jobs.applyTitle")}</h2>
            {isClosed ? (
              <p className="text-sm text-slate-500">{t("jobs.closed")}</p>
            ) : (
              <>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t("jobs.applyText")}
                  {contactEmail && (
                    <> (<span className="font-semibold text-brand-700">{contactEmail}</span>)</>
                  )}
                </p>

                {mailtoHref ? (
                  <a
                    href={mailtoHref}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
                  >
                    <Mail className="h-4 w-4" />
                    {t("jobs.applyBtn")}
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    {t("jobs.contactFallback")}{" "}
                    <Link to="/contact" className="font-semibold text-brand-600 hover:underline">
                      {t("jobs.contactPage")}
                    </Link>
                    .
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
