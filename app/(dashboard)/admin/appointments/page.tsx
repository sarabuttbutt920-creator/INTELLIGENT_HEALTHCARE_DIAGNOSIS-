"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, CalendarDays, CalendarCheck, CalendarX, Clock, User,
    Stethoscope, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MapPin,
    Video, RefreshCcw, Activity, Phone, Loader2, Eye, X
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

type AppointmentStatus = "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type ConsultationType = "IN_PERSON" | "VIDEO_CALL";

interface AppointmentRecord {
    id: string;
    patientName: string;
    patientId: string;
    patientPhone: string;
    doctorName: string;
    specialization: string;
    scheduledStart: string;
    scheduledEnd?: string;
    durationMinutes: number;
    status: AppointmentStatus;
    reason: string;
    type: ConsultationType;
    createdAt: string;
}

const statusStyles: Record<AppointmentStatus, string> = {
    REQUESTED: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200"
};

const statusIcons: Record<AppointmentStatus, any> = {
    REQUESTED: Clock,
    CONFIRMED: CheckCircle2,
    COMPLETED: Activity,
    CANCELLED: XCircle
};

const getRelativeDay = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        if (isToday(date)) return <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs ml-2">Today</span>;
        if (isTomorrow(date)) return <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-xs ml-2">Tomorrow</span>;
        if (isPast(date)) return <span className="text-text-muted font-bold bg-surface px-2 py-0.5 border border-border-light rounded text-xs ml-2">Past</span>;
    } catch { /* ignore */ }
    return null;
};

export default function AppointmentsMonitoringPage() {
    const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
    const [typeFilter, setTypeFilter] = useState<ConsultationType | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [viewAppt, setViewAppt] = useState<AppointmentRecord | null>(null);
    const itemsPerPage = 8;

    const fetchAppointments = useCallback(async (page = 1, status?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
            if (status && status !== "ALL") params.set("status", status);
            const res = await fetch(`/api/admin/appointments?${params}`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.appointments);
                setTotal(data.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments(currentPage, statusFilter);
    }, [fetchAppointments, currentPage, statusFilter]);

    const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/appointments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId: id, status: newStatus })
            });
            if (res.ok) {
                setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const matchesSearch =
                apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.specialization.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "ALL" || apt.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [appointments, searchTerm, typeFilter]);

    const totalPages = Math.ceil(total / itemsPerPage);

    const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;
    const pendingCount = appointments.filter(a => a.status === "REQUESTED").length;
    const todayCount = appointments.filter(a => {
        try { return isToday(parseISO(a.scheduledStart)) && a.status !== "CANCELLED"; } catch { return false; }
    }).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Appointments Monitoring</h1>
                    <p className="text-text-muted mt-1">Oversee, approve, and track all system-wide patient/doctor consultations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchAppointments(currentPage, statusFilter)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <RefreshCcw className="w-4 h-4" />
                        Sync
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Data
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Bookings", value: total, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Today's Schedule", value: todayCount, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Confirmed", value: confirmedCount, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Pending Approval", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((stat, idx) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{loading ? "—" : stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Status Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["ALL", "REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${statusFilter === s ? "gradient-primary text-white border-transparent shadow-sm" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}>
                        {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search by Patient, Doctor, Specialization..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                    </div>
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || typeFilter !== "ALL" ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}>
                        <Filter className="w-4 h-4" />
                        Type Filter
                        {typeFilter !== "ALL" && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
                    </button>
                </div>
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-4 border-t border-border-light grid grid-cols-2 gap-4 max-w-md">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Consultation Type</label>
                                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="ALL">All Types</option>
                                        <option value="IN_PERSON">In Person</option>
                                        <option value="VIDEO_CALL">Video Call</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {typeFilter !== "ALL" && (
                                        <button onClick={() => setTypeFilter("ALL")} className="text-sm text-red-500 font-medium hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-text-muted">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span>Loading appointments...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                    <th className="px-6 py-4 font-semibold w-52">Scheduled Time</th>
                                    <th className="px-6 py-4 font-semibold">Patient Information</th>
                                    <th className="px-6 py-4 font-semibold">Doctor Assigned</th>
                                    <th className="px-6 py-4 font-semibold w-36">Type</th>
                                    <th className="px-6 py-4 font-semibold w-36">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                                                <CalendarX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium text-lg text-text-secondary">No appointments found</p>
                                            </td>
                                        </tr>
                                    ) : filteredAppointments.map(apt => {
                                        const StatusIcon = statusIcons[apt.status];
                                        const isUpdating = updatingId === apt.id;
                                        return (
                                            <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className={`border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group ${apt.status === "CANCELLED" ? "opacity-60" : ""}`}>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center flex-wrap">
                                                            <span className="font-bold text-text-primary text-sm">
                                                                {format(new Date(apt.scheduledStart), "MMM d, yyyy")}
                                                            </span>
                                                            {getRelativeDay(apt.scheduledStart)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-primary font-semibold">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {format(new Date(apt.scheduledStart), "HH:mm")}
                                                        </div>
                                                        <div className="text-[11px] text-text-muted">{apt.durationMinutes} min</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-[220px] align-top">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-text-secondary" />{apt.patientName}
                                                        </p>
                                                        <p className="text-xs text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border-light w-fit">{apt.patientId}</p>
                                                        <p className="text-xs text-text-secondary line-clamp-2 italic border-l-2 border-primary/30 pl-2 mt-1.5">"{apt.reason}"</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                                                            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />{apt.doctorName}
                                                        </p>
                                                        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md w-fit">{apt.specialization}</p>
                                                        <div className="flex items-center gap-1 text-[11px] text-text-muted mt-1">
                                                            <Phone className="w-3 h-3" />{apt.patientPhone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {apt.type === "VIDEO_CALL" ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded w-fit">
                                                            <Video className="w-3.5 h-3.5" />Video
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded w-fit">
                                                            <MapPin className="w-3.5 h-3.5" />In-Person
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wider uppercase ${statusStyles[apt.status]}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />{apt.status}
                                                    </span>
                                                    <p className="text-[10px] text-text-muted font-mono mt-1">ID: {apt.id}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right align-top">
                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setViewAppt(apt)} title="View Details"
                                                            className="p-1.5 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-primary hover:border-primary/30 transition-colors">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {apt.status === "REQUESTED" && (
                                                            <>
                                                                <button onClick={() => updateStatus(apt.id, "CONFIRMED")} disabled={isUpdating}
                                                                    title="Confirm" className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50">
                                                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                                </button>
                                                                <button onClick={() => updateStatus(apt.id, "CANCELLED")} disabled={isUpdating}
                                                                    title="Decline" className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50">
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {apt.status === "CONFIRMED" && (
                                                            <button onClick={() => updateStatus(apt.id, "CANCELLED")} disabled={isUpdating}
                                                                title="Cancel Booking" className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50">
                                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarX className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                    </div>
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
                    <div className="px-6 py-4 border-t border-border-light bg-surface flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                            Page <span className="font-semibold text-text-primary">{currentPage}</span> of{" "}
                            <span className="font-semibold text-text-primary">{totalPages}</span> — {total} total appointments
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === idx + 1 ? "gradient-primary text-white shadow-sm" : "border border-border-light bg-white text-text-secondary hover:bg-surface"}`}>
                                    {idx + 1}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Detail Modal */}
            <AnimatePresence>
                {viewAppt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setViewAppt(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className="bg-linear-to-r from-primary to-blue-600 p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{viewAppt.id}</span>
                                    <button onClick={() => setViewAppt(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold">{viewAppt.patientName}</h2>
                                <p className="text-white/80 text-sm mt-1">{viewAppt.patientId}</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Doctor", value: viewAppt.doctorName },
                                        { label: "Specialization", value: viewAppt.specialization },
                                        { label: "Date", value: format(new Date(viewAppt.scheduledStart), "MMM d, yyyy") },
                                        { label: "Time", value: format(new Date(viewAppt.scheduledStart), "HH:mm") },
                                        { label: "Duration", value: `${viewAppt.durationMinutes} minutes` },
                                        { label: "Type", value: viewAppt.type === "VIDEO_CALL" ? "Video Call" : "In-Person" },
                                        { label: "Phone", value: viewAppt.patientPhone },
                                        { label: "Status", value: viewAppt.status },
                                    ].map(item => (
                                        <div key={item.label} className="space-y-0.5">
                                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{item.label}</p>
                                            <p className="text-sm font-semibold text-text-primary">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Reason</p>
                                    <p className="text-sm text-text-secondary bg-surface rounded-xl p-3 border border-border-light">{viewAppt.reason}</p>
                                </div>
                                {viewAppt.status === "REQUESTED" && (
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => { updateStatus(viewAppt.id, "CONFIRMED"); setViewAppt(null); }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors">
                                            <CheckCircle2 className="w-4 h-4" />Confirm
                                        </button>
                                        <button onClick={() => { updateStatus(viewAppt.id, "CANCELLED"); setViewAppt(null); }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors">
                                            <XCircle className="w-4 h-4" />Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
