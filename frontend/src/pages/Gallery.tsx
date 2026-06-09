import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { GalleryImage } from "../types";
import { EmptyState, ErrorBox, PageHeader, Spinner } from "../components/ui";

export default function Gallery() {
  const { t } = useTranslation();
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<GalleryImage | null>(null);

  useEffect(() => {
    api
      .get("/gallery")
      .then((res) => setItems(res.data.data))
      .catch(() => setError(t("gallery.loadError")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("gallery.title")} subtitle={t("gallery.subtitle")} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length === 0 ? (
          <EmptyState message={t("gallery.noPhotos")} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(img)}
                className="group aspect-square overflow-hidden rounded-xl bg-slate-100"
              >
                <img
                  src={fileUrl(img.url)}
                  alt={img.caption ?? ""}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <div className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <img src={fileUrl(active.url)} alt={active.caption ?? ""} className="max-h-[80vh] w-full rounded-xl object-contain" />
            {active.caption && <p className="mt-3 text-center text-white">{active.caption}</p>}
            <button
              type="button"
              onClick={() => setActive(null)}
              className="mx-auto mt-3 block rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
