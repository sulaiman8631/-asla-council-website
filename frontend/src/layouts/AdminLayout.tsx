import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const links = [
  { to: "/admin", label: "لوحة التحكم", end: true },
  { to: "/admin/news", label: "الأخبار" },
  { to: "/admin/jobs", label: "الوظائف" },
  { to: "/admin/tenders", label: "العطاءات" },
  { to: "/admin/reports", label: "التقارير" },
  { to: "/admin/gallery", label: "معرض الصور" },
  { to: "/admin/messages", label: "رسائل التواصل" },
  { to: "/admin/town", label: "معلومات البلدة" },
  { to: "/admin/contact-info", label: "معلومات الاتصال" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    function fetchUnread() {
      api
        .get("/dashboard")
        .then((res) => { if (active) setUnreadCount(res.data.data.unreadMessages ?? 0); })
        .catch(() => {});
    }

    fetchUnread();
    const timer = setInterval(fetchUnread, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, [location.pathname]); // re-check whenever the user navigates

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  const initial = admin?.username?.charAt(0).toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-30 flex w-64 flex-col bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-lg font-bold text-brand-700">لوحة إدارة عسلة</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <span>{link.label}</span>
                {link.to === "/admin/messages" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-slate-200 p-3 space-y-1">
          <NavLink
            to="/admin/account"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-800">{admin?.username}</p>
              <p className="text-xs text-slate-400">إعدادات الحساب</p>
            </div>
            <Settings className="h-4 w-4 shrink-0 text-slate-400" />
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>

          <NavLink to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-brand-700">
            ← العودة إلى الموقع
          </NavLink>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initial}
            </div>
            <p className="font-bold text-brand-700">لوحة إدارة عسلة</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <NavLink to="/admin/messages" className="relative">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </NavLink>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600"
              aria-label="فتح القائمة"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden items-center justify-end gap-4 border-b border-slate-200 bg-white px-8 py-2.5 lg:flex">
          {unreadCount > 0 && (
            <NavLink
              to="/admin/messages"
              className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
              رسالة غير مقروءة
            </NavLink>
          )}
          <NavLink to="/admin/account" className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initial}
            </div>
            <User className="h-3.5 w-3.5" />
            <span className="font-medium">{admin?.username}</span>
            <span className="h-2 w-2 rounded-full bg-green-500" title="متصل" />
          </NavLink>
        </div>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
