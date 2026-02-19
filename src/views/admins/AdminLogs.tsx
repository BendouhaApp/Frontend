import { useEffect, useState } from "react";
import { motion, AnimatePresence } from '@/lib/gsap-motion';
import {
  Loader2,
  Search,
  RefreshCcw,
  Filter,
  X,
  Activity,
  Clock,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

export type AdminLog = {
  id: string;
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  description?: string | null;
  created_at: string;
  staff_accounts?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
};

type LogsResponse = {
  data: AdminLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    last24h: number;
    actionCounts: Record<string, number>;
  };
};

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "CONFIRM",
  "CANCEL",
  "LOGIN",
  "LOGIN_FAILED",
];
const ENTITIES = [
  "PRODUCT",
  "CATEGORY",
  "ORDER",
  "COUPON",
  "SHIPPING",
  "USER",
  "ADMIN",
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  CONFIRM: "bg-green-50 text-green-700 border-green-200",
  CANCEL: "bg-orange-50 text-orange-700 border-orange-200",
  LOGIN: "bg-purple-50 text-purple-700 border-purple-200",
  LOGIN_FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

function parseInputDate(dateStr: string) {
  if (!dateStr) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d);
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [showActionFilter, setShowActionFilter] = useState(false);
  const [showEntityFilter, setShowEntityFilter] = useState(false);

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({
    last24h: 0,
    actionCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setPageInput("1");
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    const handleClick = () => {
      setShowActionFilter(false);
      setShowEntityFilter(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
      setPageInput("1");
    }
  }, [selectedDate, selectedActions, selectedEntities]);

  useEffect(() => {
    load(false);
  }, [page, debouncedQuery, selectedActions, selectedEntities, selectedDate]);

  async function load(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (debouncedQuery) params.append("search", debouncedQuery);

      if (selectedActions.length > 0)
        params.append("action", selectedActions.join(","));

      if (selectedEntities.length > 0)
        params.append("entity", selectedEntities.join(","));

      if (selectedDate) {
        params.append("date", selectedDate);
      }

      const res = await api.get<LogsResponse>(
        `/admins-logs?${params.toString()}`,
      );

      setLogs(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotal(res.data.meta.total);
      setStats(res.data.stats || { last24h: 0, actionCounts: {} });
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load logs");
      setLogs([]);
      setStats({ last24h: 0, actionCounts: {} });
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }

  const clearFilters = () => {
    setSelectedActions([]);
    setSelectedEntities([]);
    setSelectedDate("");
    setQuery("");
  };

  const hasActiveFilters =
    selectedActions.length > 0 ||
    selectedEntities.length > 0 ||
    selectedDate ||
    query;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Admin Logs
              </h1>
              <p className="mt-1 text-neutral-600">
                Monitor and track all administrative actions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => load(true)}
                disabled={loading || refreshing}
                className="gap-2"
              >
                <RefreshCcw
                  className={cn("h-4 w-4", refreshing && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Statistics Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Logs
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">
                  {total}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Activity className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Last 24 Hours
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">
                  {stats?.last24h ?? 0}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50">
                <Clock className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search logs (e.g. 'john', 'CREATE', 'PRODUCT', 'ORDER ID', 'LOGIN')"
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Action Filter */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowActionFilter(!showActionFilter);
                    setShowEntityFilter(false);
                  }}
                  className={cn(
                    "gap-2 transition-all",
                    selectedActions.length > 0 &&
                      "border-primary bg-primary/5 text-primary hover:bg-primary/10",
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Actions
                  {selectedActions.length > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {selectedActions.length}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>

                <AnimatePresence>
                  {showActionFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {ACTIONS.map((action) => (
                          <label
                            key={action}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedActions.includes(action)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedActions([
                                    ...selectedActions,
                                    action,
                                  ]);
                                } else {
                                  setSelectedActions(
                                    selectedActions.filter((a) => a !== action),
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                ACTION_COLORS[action],
                              )}
                            >
                              {action}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Entity Filter */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEntityFilter(!showEntityFilter);
                    setShowActionFilter(false);
                  }}
                  className={cn(
                    "gap-2 transition-all",
                    selectedEntities.length > 0 &&
                      "border-primary bg-primary/5 text-primary hover:bg-primary/10",
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Entities
                  {selectedEntities.length > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {selectedEntities.length}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>

                <AnimatePresence>
                  {showEntityFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {ENTITIES.map((entity) => (
                          <label
                            key={entity}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEntities.includes(entity)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEntities([
                                    ...selectedEntities,
                                    entity,
                                  ]);
                                } else {
                                  setSelectedEntities(
                                    selectedEntities.filter(
                                      (ent) => ent !== entity,
                                    ),
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <span className="font-medium text-neutral-700">
                              {entity}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date Picker */}
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={cn(
                    "h-9 rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                    selectedDate &&
                      "border-primary bg-primary/5 text-primary font-medium",
                  )}
                />
              </div>

              {/* Clear All */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-neutral-600 hover:text-neutral-900"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </Button>
              )}

              {/* Results Summary */}
              <span className="ml-auto text-sm font-medium text-neutral-600">
                {hasActiveFilters
                  ? `${total} filtered results`
                  : `${total} total logs`}
              </span>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                {selectedActions.map((action) => (
                  <motion.div
                    key={action}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                      ACTION_COLORS[action],
                    )}
                  >
                    <span>Action: {action}</span>
                    <button
                      onClick={() =>
                        setSelectedActions(
                          selectedActions.filter((a) => a !== action),
                        )
                      }
                      className="rounded-full hover:bg-black/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}

                {selectedEntities.map((entity) => (
                  <motion.div
                    key={entity}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700"
                  >
                    <span>Entity: {entity}</span>
                    <button
                      onClick={() =>
                        setSelectedEntities(
                          selectedEntities.filter((e) => e !== entity),
                        )
                      }
                      className="rounded-full hover:bg-neutral-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}

                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>
                      {(() => {
                        const date = parseInputDate(selectedDate);
                        if (!date) return null;

                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      })()}
                    </span>

                    <button
                      aria-label="Remove date filter"
                      onClick={() => setSelectedDate("")}
                      className="rounded-full hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Logs Table */}
        {loading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-neutral-600">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <Activity className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <p className="text-lg font-semibold text-neutral-900">
              No logs found
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "No admin activity recorded yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Entity ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <AnimatePresence initial={false}>
                    {logs.map((log, idx) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="transition hover:bg-neutral-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {log.staff_accounts?.first_name?.[0]}
                              {log.staff_accounts?.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {log.staff_accounts?.username ?? "Unknown"}
                              </p>
                              {log.staff_accounts && (
                                <p className="text-xs text-neutral-500">
                                  {log.staff_accounts.first_name}{" "}
                                  {log.staff_accounts.last_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                              ACTION_COLORS[log.action] ||
                                "bg-neutral-50 text-neutral-700 border-neutral-200",
                            )}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-neutral-700">
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="rounded bg-neutral-100 px-2 py-1 text-xs font-mono text-neutral-600">
                            {log.entity_id.slice(0, 8)}...
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <p className="max-w-xs truncate text-sm text-neutral-600">
                            {log.description || "â€”"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-neutral-500">
                            <p className="font-medium">
                              {formatDate(log.created_at)}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">Page</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1 font-semibold text-neutral-900">
                {page}
              </span>
              <span className="text-neutral-400">/</span>
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Précédent
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Aller à la page</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pageInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    setPageInput(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const n = Number(pageInput);
                    if (!Number.isFinite(n)) return;
                    const clamped = Math.min(totalPages, Math.max(1, n));
                    setPage(clamped);
                  }}
                  onBlur={() => {
                    if (!pageInput) {
                      setPageInput(String(page));
                      return;
                    }
                    const n = Number(pageInput);
                    if (!Number.isFinite(n)) {
                      setPageInput(String(page));
                      return;
                    }
                    const clamped = Math.min(totalPages, Math.max(1, n));
                    setPageInput(String(clamped));
                  }}
                  className={cn(
                    "h-9 w-14 rounded-lg border border-neutral-200 text-center text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                    pageInput &&
                      (Number(pageInput) < 1 ||
                        Number(pageInput) > totalPages) &&
                      "border-rose-300 focus:border-rose-400 focus:ring-rose-200/40",
                  )}
                  aria-label="Aller à la page"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

