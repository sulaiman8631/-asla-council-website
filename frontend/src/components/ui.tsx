import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
      {message}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-gradient-to-l from-brand-700 to-brand-600 py-12 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-brand-50">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: "open" | "closed" }) {
  const { t } = useTranslation();
  const isOpen = status === "open";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isOpen ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-600"
      }`}
    >
      {isOpen ? t("common.open") : t("common.closed")}
    </span>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        {isRtl ? "السابق" : "Previous"}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`h-9 w-9 rounded-lg text-sm font-medium ${
            p === page ? "bg-brand-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        {isRtl ? "التالي" : "Next"}
      </button>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}>{children}</div>
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const locale = i18n.language === "ar" ? "ar" : "en-GB";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatDateAr(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(new Date(value));
  } catch {
    return value ?? "";
  }
}
