import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import type { ContactInfo } from "../types";
import { Card, ErrorBox, PageHeader, Spinner } from "../components/ui";
import { SocialIcons, FacebookSvg, InstagramSvg, TwitterSvg, YoutubeSvg } from "../components/social-icons";

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
                  <div className="mt-5">
                    <SocialIcons socials={[
                      ...(info.facebook ? [{ name: "Facebook", href: info.facebook, icon: FacebookSvg }] : []),
                      ...(info.instagram ? [{ name: "Instagram", href: info.instagram, icon: InstagramSvg }] : []),
                      ...(info.twitter ? [{ name: "X", href: info.twitter, icon: TwitterSvg }] : []),
                      ...(info.youtube ? [{ name: "YouTube", href: info.youtube, icon: YoutubeSvg }] : []),
                    ]} />
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
