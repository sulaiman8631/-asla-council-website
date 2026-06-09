import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { News, NewsImage } from "../types";
import { ErrorBox, Spinner, formatDate } from "../components/ui";

export default function NewsDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/news/${id}`)
      .then((res) => setItem(res.data.data))
      .catch(() => setError(t("news.loadError")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !item) return <div className="px-4 py-10"><ErrorBox message={error || t("news.notFound")} /></div>;

  const images = item.images ?? [];
  const mainImage: NewsImage | null = images.find((img) => img.isMain) ?? images[0] ?? null;
  const galleryImages = mainImage ? images.filter((img) => img.url !== mainImage.url) : [];

  const heroUrl = mainImage ? mainImage.url : item.coverImage;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/news" className="text-sm font-semibold text-brand-700 hover:underline">
        {t("news.backToNews")}
      </Link>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
        <span>{formatDate(item.publishedAt)}</span>
        {item.category && (
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">{item.category.name}</span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-bold text-slate-800">{item.title}</h1>

      {heroUrl && (
        <div
          className="mt-6 cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100"
          onClick={() => setLightbox(heroUrl)}
        >
          <img
            src={fileUrl(heroUrl)}
            alt={item.title}
            className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-lg leading-loose text-slate-700">
        {item.body}
      </div>

      {galleryImages.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t("news.morePhotos")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="cursor-zoom-in overflow-hidden rounded-xl bg-slate-100"
                onClick={() => setLightbox(img.url)}
              >
                <img
                  src={fileUrl(img.url)}
                  alt=""
                  className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={fileUrl(lightbox)}
            alt=""
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
