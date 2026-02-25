"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    CalendarDays,
    CalendarCheck,
    CalendarX,
    Clock,
    User,
    Stethoscope,
    MoreVertical,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Video,
    RefreshCcw,
    Activity,
    Phone
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

// --- Types ---
type AppointmentStatus = "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type ConsultationType = "IN_PERSON" | "VIDEO_CALL";

interface AppointmentRecord {
    id: string; // appointment_id
    patientName: string;
    patientId: string;
    patientPhone: string;
    doctorName: string;
    specialization: string;
    scheduledStart: string;
    durationMinutes: number;
    status: AppointmentStatus;
    reason: string;
    type: ConsultationType;
    createdAt: string;
}

// --- Mock Data ---
const mockAppointments: AppointmentRecord[] = [
    {
        id: "APT-5001",
        patientName: "Michael Chen",
        patientId: "PAT-8041",
        patientPhone: "+1 (555) 987-6543",
        doctorName: "Dr. Sarah Jenkins",
        specialization: "Nephrologist",
        scheduledStart: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(), // Today 2:30 PM
        durationMinutes: 45,
        status: "CONFIRMED",
        reason: "Follow-up on recent CKD Stage 3 blood work predictions.",
        type: "IN_PERSON",
        createdAt: "2024-02-20T10:00:00Z"
    },
    {
        id: "APT-5002",
        patientName: "Emily Rodriguez",
        patientId: "PAT-8042",
        patientPhone: "+1 (555) 456-7890",
        doctorName: "Dr. James Wilson",
        specialization: "General Physician",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        durationMinutes: 30,
        status: "REQUESTED",
        reason: "General yearly checkup and prescription refill.",
        type: "VIDEO_CALL",
        createdAt: "2024-02-25T09:15:00Z"
    },
    {
        id: "APT-5003",
        patientName: "Lisa Thompson",
        patientId: "PAT-8043",
        patientPhone: "+1 (555) 789-0123",
        doctorName: "Dr. Sarah Jenkins",
        specialization: "Nephrologist",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        durationMinutes: 60,
        status: "COMPLETED",
        reason: "Initial consultation regarding proteinuria.",
        type: "IN_PERSON",
        createdAt: "2024-02-15T14:20:00Z"
    },
    {
        id: "APT-5004",
        patientName: "Robert Taylor",
        patientId: "PAT-8044",
        patientPhone: "+1 (555) 222-3333",
        doctorName: "Dr. Emily Rodriguez",
        specialization: "Urologist",
        scheduledStart: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), // Today 4:00 PM
        durationMinutes: 30,
        status: "CANCELLED",
        reason: "Patient requested cancellation due to personal emergency.",
        type: "VIDEO_CALL",
        createdAt: "2024-02-22T11:45:00Z"
    },
    {
        id: "APT-5005",
        patientName: "Alex Jordan",
        patientId: "PAT-8045",
        patientPhone: "+1 (555) 666-7777",
        doctorName: "Dr. Hassan Ali",
        specialization: "Internal Medicine",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        durationMinutes: 45,
        status: "CONFIRMED",
        reason: "Reviewing AI prediction results for hypertension.",
        type: "IN_PERSON",
        createdAt: "2024-02-24T16:30:00Z"
    },
    {
        id: "APT-5006",
        patientName: "Thomas Anderson",
        patientId: "PAT-8046",
        patientPhone: "+1 (555) 111-0000",
        doctorName: "Dr. Amanda Chen",
        specialization: "Nephrologist",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        durationMinutes: 30,
        status: "REQUESTED",
        reason: "Diabetic nephropathy follow-up.",
        type: "VIDEO_CALL",
        createdAt: "2024-02-26T08:00:00Z"
    }
];

// --- Helpers ---
const statusStyles = {
    REQUESTED: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200"
};

const statusIcons = {
    REQUESTED: Clock,
    CONFIRMED: CheckCircle2,
    COMPLETED: Activity,
    CANCELLED: XCircle
};

const getRelativeDay = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs ml-2">Today</span>;
    if (isTomorrow(date)) return <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-xs ml-2">Tomorrow</span>;
    if (isPast(date)) return <span className="text-text-muted font-bold bg-surface px-2 py-0.5 border border-border-light rounded text-xs ml-2">Past</span>;
    return null;
};

export default function AppointmentsMonitoringPage() {
    // --- State ---
    const [appointments, setAppointments] = useState<AppointmentRecord[]>(mockAppointments);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
    const [typeFilter, setTypeFilter] = useState<ConsultationType | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Actions ---
    const updateStatus = (id: string, newStatus: AppointmentStatus) => {
        setAppointments(appointments.map(apt => {
            if (apt.id === id) {
                return { ...apt, status: newStatus };
            }
            return apt;
        }));
    };

    // --- Derived Data ---
    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const matchesSearch =
                apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.specialization.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
            const matchesType = typeFilter === "ALL" || apt.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [appointments, searchTerm, statusFilter, typeFilter]);

    // Apply sorting: Upcoming first (closest to now), then past
    const sortedFilteredAppointments = useMemo(() => {
        return [...filteredAppointments].sort((a, b) => {
            return new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
        });
    }, [filteredAppointments]);

    // Pagination Calculation
    const totalPages = Math.ceil(sortedFilteredAppointments.length / itemsPerPage);
    const paginatedAppointments = sortedFilteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);

    // Aggregate Stats
    const totalApts = appointments.length;
    const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;
    const pendingCount = appointments.filter(a => a.status === "REQUESTED").length;
    const todayCount = appointments.filter(a => isToday(parseISO(a.scheduledStart)) && a.status !== "CANCELLED").length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Appointments Monitoring</h1>
                    <p className="text-text-muted mt-1">Oversee, approve, and track all system-wide patient/doctor consultations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <RefreshCcw className="w-4 h-4" />
                        Sync Calendar
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <CalendarDays className="w-4 h-4" />
                        Master Schedule
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Bookings", value: totalApts, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Today's Schedule", value: todayCount, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Confirmed Upcoming", value: confirmedCount, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Pending Approvals", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by Patient, Doctor, or Spec..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || statusFilter !== "ALL" || typeFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(statusFilter !== "ALL" || typeFilter !== "ALL") && (
                                <span className="w-2 h-2 rounded-full bg-primary ml-1" />
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
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="REQUESTED">Requested (Pending)</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Consultation Type</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value as ConsultationType | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Types</option>
                                        <option value="IN_PERSON">In Person (Clinic)</option>
                                        <option value="VIDEO_CALL">Video Consultation</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(statusFilter !== "ALL" || typeFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setStatusFilter("ALL");
                                                setTypeFilter("ALL");
                                            }}
                                            className="text-sm text-red-500 font-medium hover:underline"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-semibold w-56">Scheduled Time</th>
                                <th className="px-6 py-4 font-semibold">Patient Information</th>
                                <th className="px-6 py-4 font-semibold">Doctor Assigned</th>
                                <th className="px-6 py-4 font-semibold w-40">Consultation</th>
                                <th className="px-6 py-4 font-semibold w-40">Booking Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <CalendarX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No appointments found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedAppointments.map((apt) => {
                                        const StatusIcon = statusIcons[apt.status];

                                        return (
                                            <motion.tr
                                                key={apt.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group ${apt.status === 'CANCELLED' ? 'opacity-60' : ''}`}
                                            >
                                                {/* Time & Duration */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center">
                                                            <span className="font-bold text-text-primary text-sm">
                                                                {format(parseISO(apt.scheduledStart), "MMM d, yyyy")}
                                                            </span>
                                                            {getRelativeDay(apt.scheduledStart)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-primary font-semibold">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {format(parseISO(apt.scheduledStart), "HH:mm a")}
                                                        </div>
                                                        <div className="text-[11px] text-text-muted pt-0.5">
                                                            Duration: {apt.durationMinutes} minutes
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Patient Info */}
                                                <td className="px-6 py-4 max-w-[200px] align-top">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-text-secondary" />
                                                            {apt.patientName}
                                                        </p>
                                                        <p className="text-xs text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border-light w-fit">{apt.patientId}</p>

                                                        {/* Reason clamp */}
                                                        <p className="text-xs text-text-secondary line-clamp-2 italic border-l-2 border-primary/30 pl-2 mt-2" title={apt.reason}>
                                                            "{apt.reason}"
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Doctor Info */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                                                            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                                                            {apt.doctorName}
                                                        </p>
                                                        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md w-fit">{apt.specialization}</p>
                                                    </div>
                                                </td>

                                                {/* Consultation Type */}
                                                <td className="px-6 py-4 align-top">
                                                    {apt.type === 'VIDEO_CALL' ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded w-fit">
                                                            <Video className="w-3.5 h-3.5" />
                                                            Video Call
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded w-fit">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            In-Person
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-muted">
                                                        <Phone className="w-3 h-3" />
                                                        {apt.patientPhone}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wider shadow-sm uppercase ${statusStyles[apt.status]}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {apt.status}
                                                        </span>
                                                        <p className="text-[10px] text-text-muted font-mono block">
                                                            ID: {apt.id}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right align-top">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {apt.status === 'REQUESTED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                                                                    className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                    title="Confirm Appointment"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(apt.id, 'CANCELLED')}
                                                                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                    title="Decline Appointment"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {apt.status === 'CONFIRMED' && (
                                                            <button
                                                                onClick={() => updateStatus(apt.id, 'CANCELLED')}
                                                                className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                title="Cancel Booking"
                                                            >
                                                                <CalendarX className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button className="p-1.5 rounded-lg bg-surface border border-border-light text-text-secondary hover:bg-border-light transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
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
                    <div className="px-6 py-4 border-t border-border-light bg-surface flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                            Showing <span className="font-semibold text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                            <span className="font-semibold text-text-primary">
                                {Math.min(currentPage * itemsPerPage, sortedFilteredAppointments.length)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{sortedFilteredAppointments.length}</span> schedules
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === idx + 1
                                            ? "gradient-primary text-white shadow-sm"
                                            : "border border-border-light bg-white text-text-secondary hover:bg-surface"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
