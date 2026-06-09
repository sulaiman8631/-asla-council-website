import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { TownInfo } from "../types";
import { Card, ErrorBox, PageHeader, Spinner } from "../components/ui";

export default function About() {
  const { t, i18n } = useTranslation();
  const [town, setTown] = useState<TownInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/town")
      .then((res) => setTown(res.data.data))
      .catch(() => setError(t("about.loadError")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!town) return null;

  const popLocale = i18n.language === "ar" ? "ar" : "en";

  return (
    <div>
      <PageHeader title={t("about.title", { name: town.name })} subtitle={town.tagline ?? undefined} />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        {town.statistics.length > 0 && (
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
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {town.about && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-800">{t("about.aboutSection")}</h2>
                <p className="mt-3 whitespace-pre-line leading-loose text-slate-600">{town.about}</p>
              </Card>
            )}
            {town.history && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-800">{t("about.historySection")}</h2>
                <p className="mt-3 whitespace-pre-line leading-loose text-slate-600">{town.history}</p>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-800">{t("about.infoSection")}</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {town.mayorName && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">{t("about.mayor")}</dt>
                    <dd className="font-semibold text-slate-800">{town.mayorName}</dd>
                  </div>
                )}
                {town.population != null && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">{t("about.population")}</dt>
                    <dd className="font-semibold text-slate-800">{town.population.toLocaleString(popLocale)}</dd>
                  </div>
                )}
                {town.area && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">{t("about.area")}</dt>
                    <dd className="font-semibold text-slate-800">{town.area}</dd>
                  </div>
                )}
                {town.established && (
                  <div className="flex justify-between pb-2">
                    <dt className="text-slate-500">{t("about.established")}</dt>
                    <dd className="font-semibold text-slate-800">{town.established}</dd>
                  </div>
                )}
              </dl>
            </Card>

            {town.logo && (
              <Card className="overflow-hidden">
                <img src={fileUrl(town.logo)} alt={town.name} className="h-56 w-full object-cover" />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
