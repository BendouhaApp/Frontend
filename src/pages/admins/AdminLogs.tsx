import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Shield, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL;
const LOGS_ENDPOINT = "admins-logs";

async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = { auth: true },
): Promise<T> {
  const token = localStorage.getItem("admin_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };

  if (opts.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

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
  message?: string;
  data?: AdminLog[];
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const normalizeLogs = (res: unknown): AdminLog[] => {
    // API might return:
    // 1) { message, data: [...] }
    // 2) [...]
    // 3) { data: { data: [...] } } (some wrappers)
    if (Array.isArray(res)) return res as AdminLog[];

    const r = res as any;
    if (Array.isArray(r?.data)) return r.data as AdminLog[];
    if (Array.isArray(r?.data?.data)) return r.data.data as AdminLog[];

    return [];
  };

  const load = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const res = await api<LogsResponse | AdminLog[]>(LOGS_ENDPOINT);
      const list = normalizeLogs(res);
      setLogs(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load logs");
      setLogs([]);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;

    return logs.filter((l) => {
      const admin = l.staff_accounts?.username?.toLowerCase() ?? "";
      return (
        (l.entity ?? "").toLowerCase().includes(q) ||
        (l.action ?? "").toLowerCase().includes(q) ||
        (l.entity_id ?? "").toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q) ||
        admin.includes(q)
      );
    });
  }, [logs, query]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin Logs</h1>
          <p className="text-neutral-500">Track all admin actions in the system</p>
        </div>

        <Button
          variant="outline"
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search logs..."
          className="w-full rounded-xl border py-2 pl-9 pr-3"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading logs…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <Shield className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <p className="font-medium">No logs found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-t hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">
                    {log.staff_accounts?.username ?? log.admin_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{log.entity_id}</td>
                  <td className="px-4 py-3 text-neutral-600">{log.description ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
