"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, Globe, Network, Activity, Clock, ChevronLeft, ChevronRight,
    Download, Eye, User, Monitor, Smartphone, Terminal, RefreshCcw, Loader2,
    Users, BarChart2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface VisitorLog {
    id: string;
    userId: string | null;
    userName: string | null;
    role: string | null;
    email: string | null;
    ipAddress: string;
    userAgent: string;
    page: string;
    visitedAt: string;
}

interface LogStats {
    total24h: number;
    uniqueIPs: number;
    totalVisits: number;
}

const roleColors: Record<string, string> = {
    PATIENT: "text-emerald-600 bg-emerald-50 border-emerald-100",
    DOCTOR: "text-blue-600 bg-blue-50 border-blue-100",
    ADMIN: "text-purple-600 bg-purple-50 border-purple-100",
};

const pageColors: Record<string, string> = {
    "/": "text-slate-600 bg-slate-100",
    "/patient": "text-emerald-600 bg-emerald-50",
    "/doctor": "text-blue-600 bg-blue-50",
    "/admin": "text-purple-600 bg-purple-50",
};

function getPageColor(page: string) {
    for (const key of Object.keys(pageColors)) {
        if (page.startsWith(key) && key !== "/") return pageColors[key];
        if (key === "/" && page === "/") return pageColors["/"];
    }
    return "text-slate-600 bg-slate-100";
}

function detectDevice(userAgent: string): "desktop" | "mobile" | "bot" {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "mobile";
    if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider") || ua.includes("python")) return "bot";
    return "desktop";
}

function getBrowser(userAgent: string): string {
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.toLowerCase().includes("python")) return "Python Script";
    return userAgent.split(" ")[0] || "Unknown";
}

export default function VisitorLogsPage() {
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [stats, setStats] = useState<LogStats>({ total24h: 0, uniqueIPs: 0, totalVisits: 0 });
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewLog, setViewLog] = useState<VisitorLog | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const itemsPerPage = 15;

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/logs?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
                setTotal(data.total);
                setStats(data.stats);
                setLastRefresh(new Date());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(currentPage);
        const interval = setInterval(() => fetchLogs(currentPage), 30000);
        return () => clearInterval(interval);
    }, [fetchLogs, currentPage]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                (log.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress.includes(searchTerm) ||
                log.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userAgent.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === "ALL" || (log.role === roleFilter) || (roleFilter === "ANONYMOUS" && !log.role);
            return matchesSearch && matchesRole;
        });
    }, [logs, searchTerm, roleFilter]);

    const totalPages = Math.ceil(total / itemsPerPage);

    const downloadCSV = () => {
        const rows = [
            ["ID", "User", "Role", "Email", "IP Address", "Page", "User Agent", "Visited At"],
            ...filteredLogs.map(l => [
                l.id, l.userName || "Anonymous", l.role || "N/A", l.email || "N/A",
                l.ipAddress, l.page, l.userAgent, l.visitedAt
            ])
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = `visitor_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                        <Globe className="w-8 h-8 text-primary" />
                        Visitor Logs
                    </h1>
                    <p className="text-text-muted mt-1">
                        Real-time website visitor tracking. Auto-refreshes every 30s.{" "}
                        <span className="text-xs text-text-muted">Last updated: {format(lastRefresh, "HH:mm:ss")}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchLogs(currentPage)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button onClick={downloadCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-colors font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Visits (Last 24H)", value: stats.total24h, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Unique IP Addresses", value: stats.uniqueIPs, icon: Network, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Total Visits (All Time)", value: stats.totalVisits, icon: BarChart2, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Loaded This Page", value: logs.length, icon: Users, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((stat, idx) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover relative overflow-hidden">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{loading ? "—" : stat.value.toLocaleString()}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search by Name, Email, IP, or Page..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono" />
                    </div>
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || roleFilter !== "ALL" ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}>
                        <Filter className="w-4 h-4" />
                        Role Filter
                        {roleFilter !== "ALL" && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
                    </button>
                </div>

                {/* Role tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {["ALL", "PATIENT", "DOCTOR", "ADMIN", "ANONYMOUS"].map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${roleFilter === r ? "gradient-primary text-white border-transparent shadow-sm" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}>
                            {r === "ALL" ? "All Visitors" : r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-4 border-t border-border-light">
                                <p className="text-xs text-text-muted">Use the role tabs above to filter by user type, or search by name/email/IP/page in the search bar.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-text-muted">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span>Loading visitor logs...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border-light text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-5 py-4 font-semibold w-44">Visited At</th>
                                    <th className="px-5 py-4 font-semibold">Visitor</th>
                                    <th className="px-5 py-4 font-semibold w-32">Role</th>
                                    <th className="px-5 py-4 font-semibold w-44">IP Address</th>
                                    <th className="px-5 py-4 font-semibold w-52">Page Visited</th>
                                    <th className="px-5 py-4 font-semibold">Device / Browser</th>
                                    <th className="px-5 py-4 font-semibold text-right w-20">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                                                <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium text-lg text-text-secondary">No visitor logs found</p>
                                                <p className="text-sm">Try adjusting your search or filters.</p>
                                            </td>
                                        </tr>
                                    ) : filteredLogs.map((log) => {
                                        const device = detectDevice(log.userAgent);
                                        const browser = getBrowser(log.userAgent);
                                        const DeviceIcon = device === "mobile" ? Smartphone : device === "bot" ? Terminal : Monitor;

                                        return (
                                            <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="border-b border-border-light last:border-0 hover:bg-slate-50/70 transition-colors group">
                                                <td className="px-5 py-3.5 align-top">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {format(new Date(log.visitedAt), "MMM d, HH:mm")}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 pl-5">
                                                            {formatDistanceToNow(new Date(log.visitedAt), { addSuffix: true })}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 align-top">
                                                    {log.userName ? (
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />{log.userName}
                                                            </div>
                                                            {log.email && <span className="text-xs text-slate-500 block pl-5">{log.email}</span>}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-slate-400 italic text-sm">
                                                            <Globe className="w-3.5 h-3.5" />Anonymous Visitor
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 align-top">
                                                    {log.role ? (
                                                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${roleColors[log.role] || "text-slate-600 bg-slate-100 border-slate-200"}`}>
                                                            {log.role}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-bold px-2 py-1 rounded-md border text-slate-500 bg-slate-50 border-slate-200">
                                                            GUEST
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 align-top">
                                                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 w-fit">
                                                        <Network className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-32">{log.ipAddress}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 align-top">
                                                    <span className={`text-xs font-mono px-2 py-1 rounded-md font-semibold ${getPageColor(log.page)}`}>
                                                        {log.page || "/"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 align-top">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <DeviceIcon className={`w-3.5 h-3.5 shrink-0 ${device === "bot" ? "text-amber-500" : device === "mobile" ? "text-blue-500" : "text-slate-400"}`} />
                                                        <span className="truncate max-w-40">{browser}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-right align-top">
                                                    <button onClick={() => setViewLog(log)}
                                                        className="p-1.5 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-primary hover:border-primary/30 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border-light bg-slate-50 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
                            <span className="font-semibold text-slate-700">{totalPages}</span> — {total.toLocaleString()} total visits
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === idx + 1 ? "bg-slate-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>
                                    {idx + 1}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {viewLog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setViewLog(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden text-white"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-white/80" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white">Visit Details</h2>
                                        <p className="text-xs text-slate-400">Log #{viewLog.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewLog(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="text-white text-xl leading-none">&times;</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4 font-mono text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Visitor", value: viewLog.userName || "Anonymous" },
                                        { label: "Role", value: viewLog.role || "GUEST" },
                                        { label: "Email", value: viewLog.email || "—" },
                                        { label: "IP Address", value: viewLog.ipAddress },
                                        { label: "Page", value: viewLog.page || "/" },
                                        { label: "Time", value: format(new Date(viewLog.visitedAt), "MMM d, yyyy HH:mm:ss") },
                                    ].map(item => (
                                        <div key={item.label} className="space-y-1">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">{item.label}</p>
                                            <p className="text-white text-xs break-all">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-1 pt-2 border-t border-white/10">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">User Agent</p>
                                    <p className="text-slate-300 text-xs break-all leading-relaxed">{viewLog.userAgent}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
