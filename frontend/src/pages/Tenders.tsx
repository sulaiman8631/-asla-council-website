import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import type { Tender } from "../types";
import { Card, EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge, formatDate } from "../components/ui";

export default function Tenders() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/tenders")
      .then((res) => setItems(res.data.data))
      .catch(() => setError(t("tenders.listError")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("tenders.title")} subtitle={t("tenders.subtitle")} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length === 0 ? (
          <EmptyState message={t("tenders.noTenders")} />
        ) : (
          <div className="space-y-4">
            {items.map((tender) => (
              <Link key={tender.id} to={`/tenders/${tender.id}`} className="block">
                <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brand-600">
                        {t("tenders.refNo", { ref: tender.referenceNo })}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-800">{tender.title}</h3>
                      <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>{t("tenders.publishDate", { date: formatDate(tender.publishDate) })}</span>
                        <span>{t("tenders.deadline", { date: formatDate(tender.deadline) })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={tender.status} />
                      <span className="text-sm font-semibold text-brand-600">{t("common.viewDetails")}</span>
                    </div>
                  </div>

                  {tender.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {tender.description}
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
