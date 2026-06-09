import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { fileUrl } from "../lib/api";
import type { TownInfo, ContactInfo } from "../types";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { SocialIcons, FacebookSvg, InstagramSvg, TwitterSvg, YoutubeSvg } from "../components/social-icons";

export default function PublicLayout() {
  const { t } = useTranslation();
  const [town, setTown] = useState<TownInfo | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/about", label: t("nav.about") },
    { to: "/news", label: t("nav.news") },
    { to: "/jobs", label: t("nav.jobs") },
    { to: "/tenders", label: t("nav.tenders") },
    { to: "/reports", label: t("nav.reports") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    api.get("/town").then((res) => setTown(res.data.data)).catch(() => setTown(null));
    api.get("/contact-info").then((res) => setContact(res.data.data)).catch(() => setContact(null));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const councilName = t("councilName", { name: town?.name ?? "عسلة" });

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            {town?.logo ? (
              <img src={fileUrl(town.logo)} alt={town?.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {town?.name?.charAt(0) ?? "ع"}
              </div>
            )}
            <div className="text-right">
              <p className="text-lg font-bold text-brand-700">{councilName}</p>
              {town?.tagline && <p className="text-xs text-slate-500">{town.tagline}</p>}
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-brand-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <LanguageSwitcher className="ms-2" />
            {contact?.facebook && (
              <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="ms-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                {FacebookSvg}
              </a>
            )}
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            {contact?.facebook && (
              <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                {FacebookSvg}
              </a>
            )}
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600"
              aria-label={t("nav.home")}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-lg font-bold text-brand-700">{councilName}</p>
              {town?.about && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{town.about}</p>}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t("footer.quickLinks")}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {navLinks.slice(1).map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className="hover:text-brand-700">
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t("footer.contactUs")}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>
                  <NavLink to="/contact" className="hover:text-brand-700">
                    {t("footer.contactPage")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/login" className="hover:text-brand-700">
                    {t("footer.adminLogin")}
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-500">
              {t("footer.rights", { year: new Date().getFullYear(), name: town?.name ?? "عسلة" })}
            </p>
            <div className="flex items-center gap-2">
              {contact?.facebook && (
                <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                  {FacebookSvg}
                </a>
              )}
              {contact?.instagram && (
                <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                  {InstagramSvg}
                </a>
              )}
              {contact?.twitter && (
                <a href={contact.twitter} target="_blank" rel="noreferrer" aria-label="X"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                  {TwitterSvg}
                </a>
              )}
              {contact?.youtube && (
                <a href={contact.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                  {YoutubeSvg}
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
