import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import type { Job } from "../../types";
import { EmptyState, ErrorBox, Spinner, StatusBadge, formatDateAr } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

type Filters = { status: string[]; type: string[]; dateFrom: string; dateTo: string };

const inputCls = "w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none";

export default function JobsList() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({ status: [], type: [], dateFrom: "", dateTo: "" });

  function load() {
    setLoading(true);
    api.get("/jobs").then((res) => setItems(res.data.data)).catch(() => setError("تعذر تحميل الوظائف")).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const types = useMemo(() => Array.from(new Set(items.map((i) => i.type).filter(Boolean))) as string[], [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const matchSearch = !search || item.title.includes(search) || item.description?.includes(search);
    const matchStatus = filters.status.length === 0 || filters.status.includes(item.status);
    const matchType = filters.type.length === 0 || filters.type.includes(item.type ?? "");
    const d = new Date(item.deadline);
    const matchFrom = !filters.dateFrom || d >= new Date(filters.dateFrom);
    const matchTo = !filters.dateTo || d <= new Date(filters.dateTo + "T23:59:59");
    return matchSearch && matchStatus && matchType && matchFrom && matchTo;
  }), [items, search, filters]);

  const activeFilters = filters.status.length + filters.type.length + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  function toggleFilter(key: "status" | "type", val: string) {
    setFilters((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val] }));
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try { await api.delete(`/jobs/${toDelete.id}`); setToDelete(null); load(); }
    catch { setError("تعذر حذف الإعلان الوظيفي"); }
    finally { setDeleting(false); }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الوظائف</h1>
          <p className="mt-0.5 text-sm text-slate-500">{filtered.length !== items.length ? `عرض ${filtered.length} من ${items.length}` : `${items.length} إعلان`}</p>
        </div>
        <Link to="/admin/jobs/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">+ إعلان جديد</Link>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input placeholder="بحث بالعنوان أو الوصف..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} pr-9`} />
        </div>
        <button type="button" onClick={() => setShowFilters((v) => !v)}
          className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          <Filter className="h-4 w-4" />فلتر
          {activeFilters > 0 && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">{activeFilters}</span>}
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : items.length === 0 ? <EmptyState message="لا توجد إعلانات وظيفية بعد" /> : (
        <div className="flex flex-1 gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Column headers */}
            <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500">
              <div className="w-5 shrink-0" />
              <div className="w-20 shrink-0">الحالة</div>
              <div className="flex-1">العنوان</div>
              <div className="w-24 shrink-0 text-center">النوع</div>
              <div className="w-28 shrink-0 text-center">آخر موعد</div>
            </div>

            {filtered.length === 0 ? <EmptyState message="لا توجد نتائج تطابق الفلتر" /> : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filtered.map((item, index) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, delay: index * 0.02 }}>
                      <button type="button" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="flex w-full items-center gap-4 px-5 py-3.5 text-right transition-colors hover:bg-slate-50">
                        <motion.div animate={{ rotate: expandedId === item.id ? 180 : 0 }} transition={{ duration: 0.2 }} className="w-5 shrink-0">
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </motion.div>
                        <div className="w-20 shrink-0"><StatusBadge status={item.status} /></div>
                        <p className="flex-1 truncate text-sm font-medium text-slate-800">{item.title}</p>
                        <div className="w-24 shrink-0 text-center text-xs text-slate-400">{item.type ?? "—"}</div>
                        <div className="w-28 shrink-0 text-center font-mono text-xs text-slate-400">{formatDateAr(item.deadline)}</div>
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedId === item.id && (
                          <motion.div key="exp" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-slate-100 bg-slate-50/70">
                            <div className="space-y-3 px-5 py-4">
                              <p className="rounded-lg bg-white p-3 text-sm leading-relaxed text-slate-600 shadow-sm line-clamp-4">{item.description}</p>
                              {item.requirements && <p className="text-sm text-slate-500"><strong>المتطلبات:</strong> {item.requirements}</p>}
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>الموقع: <strong>{item.location ?? "عسلة"}</strong></span>
                                <div className="flex gap-3 text-sm">
                                  <Link to={`/admin/jobs/${item.id}`} className="font-medium text-brand-700 hover:underline">تعديل</Link>
                                  <button type="button" onClick={() => setToDelete(item)} className="font-medium text-red-600 hover:underline">حذف</button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div key="fp" initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-700">الفلاتر</p>
                    {activeFilters > 0 && <button type="button" onClick={() => setFilters({ status: [], type: [], dateFrom: "", dateTo: "" })} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"><X className="h-3 w-3" /> مسح الكل</button>}
                  </div>
                  <DateRangeFilter dateFrom={filters.dateFrom} dateTo={filters.dateTo} onChange={(f, t) => setFilters((p) => ({ ...p, dateFrom: f, dateTo: t }))} />
                  <FilterGroup label="الحالة" options={[{ value: "open", label: "مفتوح" }, { value: "closed", label: "مغلق" }]} selected={filters.status} onToggle={(v) => toggleFilter("status", v)} />
                  {types.length > 0 && <FilterGroup label="النوع" options={types.map((t) => ({ value: t, label: t }))} selected={filters.type} onToggle={(v) => toggleFilter("type", v)} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} title="حذف الإعلان الوظيفي" message={`هل أنت متأكد من حذف "${toDelete?.title}"؟`} onConfirm={handleDelete} onCancel={() => setToDelete(null)} busy={deleting} />
    </div>
  );
}

function DateRangeFilter({ dateFrom, dateTo, onChange }: { dateFrom: string; dateTo: string; onChange: (from: string, to: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">التاريخ</p>
      <label className="text-xs text-slate-500">من</label>
      <input type="date" value={dateFrom} onChange={(e) => onChange(e.target.value, dateTo)} className={inputCls} />
      <label className="text-xs text-slate-500">إلى</label>
      <input type="date" value={dateTo} onChange={(e) => onChange(dateFrom, e.target.value)} className={inputCls} />
    </div>
  );
}

function FilterGroup({ label, options, selected, onToggle }: { label: string; options: { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <motion.button key={opt.value} type="button" whileHover={{ x: -2 }} onClick={() => onToggle(opt.value)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${active ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50"}`}>
            <span>{opt.label}</span>
            {active && <Check className="h-3.5 w-3.5" />}
          </motion.button>
        );
      })}
    </div>
  );
}
