import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  function toggle() {
    i18n.changeLanguage(isAr ? "en" : "ar");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 ${className}`}
      aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
    >
      {isAr ? "EN" : "ع"}
    </button>
  );
}
