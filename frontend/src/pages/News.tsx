import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { News as NewsItem, Pagination as PaginationType } from "../types";
import { Card, EmptyState, ErrorBox, PageHeader, Pagination, Spinner, formatDate } from "../components/ui";

export default function News() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const [items, setItems] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/news", { params: { page, limit: 9 } })
      .then((res) => {
        setItems(res.data.data.items);
        setPagination(res.data.data.pagination);
      })
      .catch(() => setError(t("news.listError")))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title={t("news.title")} subtitle={t("news.subtitle")} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length === 0 ? (
          <EmptyState message={t("news.noNews")} />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link key={item.id} to={`/news/${item.id}`}>
                  <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      {item.coverImage ? (
                        <img src={fileUrl(item.coverImage)} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">{t("common.noImage")}</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{formatDate(item.publishedAt)}</span>
                        {item.category && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">{item.category.name}</span>
                        )}
                      </div>
                      <h3 className="mt-2 line-clamp-2 font-semibold text-slate-800">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.body}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={(p) => setSearchParams({ page: String(p) })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
