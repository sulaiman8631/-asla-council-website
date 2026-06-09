import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Download, FileText, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { Tender } from "../types";
import { ErrorBox, Spinner, StatusBadge, formatDate } from "../components/ui";

export default function TenderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/tenders/${id}`)
      .then((res) => setTender(res.data.data))
      .catch(() => setError(t("tenders.loadError")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !tender) return <div className="px-4 py-10"><ErrorBox message={error || t("tenders.notFound")} /></div>;

  const isPast = new Date(tender.deadline) < new Date();
  const isClosed = tender.status === "closed" || isPast;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tenders" className="text-sm font-semibold text-brand-700 hover:underline">
        {t("tenders.backToTenders")}
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="bg-gradient-to-l from-brand-700 to-brand-600 px-6 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-200">
                <Hash className="h-4 w-4" />
                {t("tenders.refNo", { ref: tender.referenceNo })}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-snug">{tender.title}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-brand-100">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {t("tenders.publishDate", { date: formatDate(tender.publishDate) })}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {t("tenders.deadline", { date: formatDate(tender.deadline) })}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={isClosed ? "closed" : "open"} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {tender.description && (
            <div>
              <h2 className="mb-3 text-base font-bold text-slate-800">{t("tenders.description")}</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">{tender.description}</p>
            </div>
          )}

          <div className={`rounded-xl p-4 ${isClosed ? "bg-slate-50 text-slate-500" : "bg-brand-50 text-brand-800"}`}>
            <p className="text-sm font-semibold">
              {isClosed
                ? t("tenders.closedNotice")
                : t("tenders.openNotice", { date: formatDate(tender.deadline) })}
            </p>
          </div>

          {tender.document ? (
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{t("tenders.documentTitle")}</p>
                <p className="text-xs text-slate-400">{t("tenders.documentType")}</p>
              </div>
              <a
                href={fileUrl(tender.document)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Download className="h-4 w-4" />
                {t("common.download")}
              </a>
            </div>
          ) : (
            <p className="text-sm text-slate-400">{t("tenders.noDocument")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
