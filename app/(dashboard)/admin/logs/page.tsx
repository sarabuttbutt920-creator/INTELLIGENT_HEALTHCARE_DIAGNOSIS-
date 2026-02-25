"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    ShieldAlert,
    ShieldCheck,
    Terminal,
    Key,
    UserX,
    ServerCrash,
    HardDriveDownload,
    Eye,
    ChevronLeft,
    ChevronRight,
    Download,
    Globe,
    Network,
    AlertTriangle,
    Activity,
    Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// --- Types ---
type LogSeverity = "INFO" | "WARNING" | "CRITICAL";
type EventType = "LOGIN_SUCCESS" | "LOGIN_FAILED" | "DATA_EXPORT" | "PREDICTION_RUN" | "SYSTEM_ERROR" | "PASSWORD_RESET";

interface SystemLog {
    id: string; // log_id
    userId?: string;
    userName?: string;
    role?: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    event: EventType;
    severity: LogSeverity;
    message: string;
    timestamp: string;
}

// --- Mock Data ---
const mockLogs: SystemLog[] = [
    {
        id: "LOG-99401",
        userId: "PAT-8041",
        userName: "Michael Chen",
        role: "Patient",
        ipAddress: "192.168.1.45",
        userAgent: "Chrome 122.0.0.0 / macOS",
        location: "New York, USA",
        event: "LOGIN_SUCCESS",
        severity: "INFO",
        message: "User successfully authenticated via standard credentials.",
        timestamp: new Date().toISOString()
    },
    {
        id: "LOG-99402",
        ipAddress: "85.202.14.99",
        userAgent: "Unknown / Python Requests",
        location: "Moscow, RUS",
        event: "LOGIN_FAILED",
        severity: "WARNING",
        message: "Failed login attempt: Invalid token format. Route: /api/auth/login",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString() // 15 mins ago
    },
    {
        id: "LOG-99403",
        userId: "ADM-001",
        userName: "System Admin",
        role: "Admin",
        ipAddress: "10.0.0.15",
        userAgent: "Firefox 123.0.0 / Windows 11",
        location: "London, UK",
        event: "DATA_EXPORT",
        severity: "INFO",
        message: "Admin exported 1,240 records from Patients Registry as CSV.",
        timestamp: new Date(Date.now() - 45 * 60000).toISOString() // 45 mins ago
    },
    {
        id: "LOG-99404",
        userId: "DOC-3042",
        userName: "Dr. James Wilson",
        role: "Doctor",
        ipAddress: "172.16.254.1",
        userAgent: "Safari 17.2 / iOS",
        location: "Toronto, CAN",
        event: "PREDICTION_RUN",
        severity: "INFO",
        message: "Ran KidneyNet-RF v1.8.5 inference on patient PAT-8042.",
        timestamp: new Date(Date.now() - 120 * 60000).toISOString() // 2 hrs ago
    },
    {
        id: "LOG-99405",
        ipAddress: "Internal Load Balancer",
        userAgent: "AWS HealthCheck",
        location: "us-east-1",
        event: "SYSTEM_ERROR",
        severity: "CRITICAL",
        message: "Database connection timeout (5000ms) on Model Server Instance 2.",
        timestamp: new Date(Date.now() - 180 * 60000).toISOString() // 3 hrs ago
    },
    {
        id: "LOG-99406",
        userId: "PAT-8044",
        userName: "Robert Taylor",
        role: "Patient",
        ipAddress: "203.0.113.88",
        userAgent: "Chrome Mobile 121.0.0 / Android",
        location: "Sydney, AUS",
        event: "PASSWORD_RESET",
        severity: "WARNING",
        message: "User requested password reset link. IP mismatch from previous login.",
        timestamp: new Date(Date.now() - 360 * 60000).toISOString() // 6 hrs ago
    },
    {
        id: "LOG-99407",
        ipAddress: "85.202.14.99",
        userAgent: "Unknown / Python Requests",
        location: "Moscow, RUS",
        event: "LOGIN_FAILED",
        severity: "CRITICAL",
        message: "Multiple failed login attempts > 5. IP Temporarily Banned.",
        timestamp: new Date(Date.now() - 14 * 60000).toISOString() // 14 mins ago
    }
];

// --- Helpers ---
const severityStyles = {
    INFO: "bg-blue-100 text-blue-700 border-blue-200",
    WARNING: "bg-amber-100 text-amber-700 border-amber-200",
    CRITICAL: "bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-200 animate-pulse-soft"
};

const severityIcons = {
    INFO: Terminal,
    WARNING: AlertTriangle,
    CRITICAL: ServerCrash
};

const eventIcons: Record<EventType, any> = {
    LOGIN_SUCCESS: ShieldCheck,
    LOGIN_FAILED: UserX,
    DATA_EXPORT: HardDriveDownload,
    PREDICTION_RUN: Activity,
    SYSTEM_ERROR: ServerCrash,
    PASSWORD_RESET: Key
};

const roleColors: Record<string, string> = {
    Patient: "text-emerald-600 bg-emerald-50",
    Doctor: "text-blue-600 bg-blue-50",
    Admin: "text-purple-600 bg-purple-50",
    System: "text-slate-600 bg-slate-100"
};

export default function VisitorLogsPage() {
    // --- State ---
    const [logs, setLogs] = useState<SystemLog[]>(mockLogs);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState<LogSeverity | "ALL">("ALL");
    const [eventFilter, setEventFilter] = useState<EventType | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Derived explicit events
    const uniqueEvents = useMemo(() => {
        const evts = new Set(logs.map(l => l.event));
        return Array.from(evts).sort();
    }, [logs]);

    // --- Derived Data ---
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                (log.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.userId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress.includes(searchTerm) ||
                log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.message.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter;
            const matchesEvent = eventFilter === "ALL" || log.event === eventFilter;

            return matchesSearch && matchesSeverity && matchesEvent;
        });
    }, [logs, searchTerm, severityFilter, eventFilter]);

    // Apply sorting: Most recent first
    const sortedLogs = useMemo(() => {
        return [...filteredLogs].sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [filteredLogs]);

    // Pagination Calculation
    const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
    const paginatedLogs = sortedLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, severityFilter, eventFilter]);

    // Aggregate Stats
    const totalEvents24h = logs.length;
    const criticalCount = logs.filter(l => l.severity === "CRITICAL").length;
    const failedLogins = logs.filter(l => l.event === "LOGIN_FAILED").length;
    const uniqueIPs = new Set(logs.map(l => l.ipAddress)).size;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                        <Terminal className="w-8 h-8 text-primary" />
                        System Security & Access Logs
                    </h1>
                    <p className="text-text-muted mt-1">Monitor authentication attempts, API errors, and platform interactions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Filter className="w-4 h-4" />
                        Time Range
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-colors font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Download CSV Dump
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Events (24H)", value: totalEvents24h, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Unique IP Connections", value: uniqueIPs, icon: Network, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Failed Auth Attempts", value: failedLogins, icon: UserX, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Critical Anomalies", value: criticalCount, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover overflow-hidden relative"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary z-10 relative">{stat.value}</h3>
                        </div>
                        {stat.label === "Critical Anomalies" && stat.value > 0 && (
                            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500 animate-pulse" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Query by User ID, Name, Action, MSG, or IP Address (IPv4 / IPv6)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all text-sm font-mono"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || severityFilter !== "ALL" || eventFilter !== "ALL"
                                    ? "bg-slate-100 border-slate-300 text-slate-800"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(severityFilter !== "ALL" || eventFilter !== "ALL") && (
                                <span className="w-2 h-2 rounded-full bg-slate-800 ml-1" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Severity Level</label>
                                    <select
                                        value={severityFilter}
                                        onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-slate-400 outline-none"
                                    >
                                        <option value="ALL">All Levels</option>
                                        <option value="INFO">Info (Standard)</option>
                                        <option value="WARNING">Warning</option>
                                        <option value="CRITICAL">Critical Events</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Event Action Type</label>
                                    <select
                                        value={eventFilter}
                                        onChange={(e) => setEventFilter(e.target.value as EventType | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-slate-400 outline-none"
                                    >
                                        <option value="ALL">All System Events</option>
                                        {uniqueEvents.map(evt => (
                                            <option key={evt} value={evt}>{evt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(severityFilter !== "ALL" || eventFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setSeverityFilter("ALL");
                                                setEventFilter("ALL");
                                            }}
                                            className="text-sm text-red-500 font-medium hover:underline"
                                        >
                                            Reset Queries
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logs Terminal Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden font-mono text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-border-light text-slate-500 text-xs uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold w-40">Timestamp</th>
                                <th className="px-6 py-4 font-semibold w-32">Severity</th>
                                <th className="px-6 py-4 font-semibold">User Context</th>
                                <th className="px-6 py-4 font-semibold w-48">Event Code</th>
                                <th className="px-6 py-4 font-semibold">Message & Device Context</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-sans">
                                            <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No logs matching query</p>
                                            <p className="text-sm">Try adjusting your filters or search strings.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLogs.map((log) => {
                                        const SeverityIcon = severityIcons[log.severity];
                                        const EventIcon = eventIcons[log.event];
                                        const roleStyle = roleColors[log.role || "System"];

                                        return (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`border-b border-border-light last:border-0 hover:bg-slate-50 transition-colors group ${log.severity === 'CRITICAL' ? 'bg-rose-50/30' : ''}`}
                                            >
                                                {/* Timestamp */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 pl-5 font-sans">
                                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 pt-1 pl-1">
                                                            {log.id}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Severity */}
                                                <td className="px-6 py-4 align-top">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-bold border tracking-widest uppercase ${severityStyles[log.severity]}`}>
                                                        <SeverityIcon className="w-3 h-3" />
                                                        {log.severity}
                                                    </span>
                                                </td>

                                                {/* User Context */}
                                                <td className="px-6 py-4 align-top">
                                                    {log.userName ? (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-800 font-semibold">{log.userName}</span>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleStyle}`}>
                                                                    {log.role}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-slate-500 block">ID: {log.userId}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-slate-400 italic text-xs">
                                                            <Globe className="w-3.5 h-3.5" />
                                                            Anonymous / System
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Event Type */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                                                        <EventIcon className="w-4 h-4 text-slate-400" />
                                                        {log.event}
                                                    </div>
                                                </td>

                                                {/* Message & Context */}
                                                <td className="px-6 py-4 align-top max-w-md">
                                                    <div className="space-y-2">
                                                        <p className={`text-xs leading-relaxed ${log.severity === 'CRITICAL' ? 'text-rose-700 font-semibold' : 'text-slate-700'}`}>
                                                            {log.message}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 text-[10px]">
                                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                                <Network className="w-3 h-3" />
                                                                {log.ipAddress}
                                                            </span>
                                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                                                {log.location}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate" title={log.userAgent}>
                                                            {log.userAgent}
                                                        </p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border-light bg-slate-50 flex items-center justify-between font-sans">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                            <span className="font-semibold text-slate-700">
                                {Math.min(currentPage * itemsPerPage, sortedLogs.length)}
                            </span>{" "}
                            of <span className="font-semibold text-slate-700">{sortedLogs.length}</span> security events
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === idx + 1
                                            ? "bg-slate-800 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
