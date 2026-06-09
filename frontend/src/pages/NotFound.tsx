import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-800">{t("notFound.title")}</h1>
      <p className="mt-2 text-slate-500">{t("notFound.message")}</p>
      <Link to="/" className="mt-6 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
