import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import type { ContactInfo } from "../types";
import { Card, ErrorBox, PageHeader, Spinner } from "../components/ui";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const { t } = useTranslation();
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api
      .get("/contact-info")
      .then((res) => setInfo(res.data.data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      await api.post("/contact", form);
      setStatus("sent");
      setForm(initialForm);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.response?.data?.message || t("contact.sendError"));
    }
  }

  return (
    <div>
      <PageHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-800">{t("contact.infoTitle")}</h2>
                <ul className="mt-4 space-y-3 text-slate-600">
                  {info?.address && (
                    <li><span className="font-semibold text-slate-700">{t("contact.address")}: </span>{info.address}</li>
                  )}
                  {info?.phone && (
                    <li><span className="font-semibold text-slate-700">{t("contact.phone")}: </span><a href={`tel:${info.phone}`} className="hover:text-brand-700">{info.phone}</a></li>
                  )}
                  {info?.email && (
                    <li><span className="font-semibold text-slate-700">{t("contact.email")}: </span><a href={`mailto:${info.email}`} className="hover:text-brand-700">{info.email}</a></li>
                  )}
                  {info?.workingHours && (
                    <li><span className="font-semibold text-slate-700">{t("contact.workingHours")}: </span>{info.workingHours}</li>
                  )}
                </ul>

                {(info?.facebook || info?.instagram || info?.twitter || info?.youtube) && (
                  <div className="mt-5 flex gap-3">
                    {info?.facebook && (
                      <a href={info.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {info?.instagram && (
                      <a href={info.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1306C] text-white hover:bg-[#c13584] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </a>
                    )}
                    {info?.twitter && (
                      <a href={info.twitter} target="_blank" rel="noreferrer" aria-label="Twitter/X"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:bg-slate-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {info?.youtube && (
                      <a href={info.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white hover:bg-[#cc0000] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </Card>

              {info?.mapEmbedUrl && (
                <Card className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      src={info.mapEmbedUrl}
                      title={t("contact.mapTitle")}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </Card>
              )}
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-800">{t("contact.formTitle")}</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t("contact.name")}</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t("contact.emailField")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t("contact.subject")}</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t("contact.message")}</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {status === "sent" && (
                  <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    {t("contact.sentSuccess")}
                  </p>
                )}
                {status === "error" && errorMessage && <ErrorBox message={errorMessage} />}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {status === "sending" ? t("contact.sending") : t("contact.sendBtn")}
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
