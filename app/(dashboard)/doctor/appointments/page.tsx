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
    MoreVertical,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Video,
    RefreshCcw,
    Activity,
    Phone,
    FileText,
    Play
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO, differenceInMinutes } from "date-fns";

// --- Types ---
type AppointmentStatus = "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type ConsultationType = "IN_PERSON" | "VIDEO_CALL";

interface AppointmentRecord {
    id: string; // appointment_id
    patientName: string;
    patientId: string;
    patientPhone: string;
    patientAvatar: string;
    scheduledStart: string;
    durationMinutes: number;
    status: AppointmentStatus;
    reason: string;
    type: ConsultationType;
    isNewPatient: boolean;
    createdAt: string;
}

// --- Mock Data ---
const mockAppointments: AppointmentRecord[] = [
    {
        id: "APT-5001",
        patientName: "Michael Chen",
        patientId: "PAT-8041",
        patientPhone: "+1 (555) 987-6543",
        patientAvatar: "M",
        scheduledStart: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(), // Today 2:30 PM
        durationMinutes: 45,
        status: "CONFIRMED",
        reason: "Follow-up on recent CKD Stage 3 blood work predictions.",
        type: "IN_PERSON",
        isNewPatient: false,
        createdAt: "2024-02-20T10:00:00Z"
    },
    {
        id: "APT-5002",
        patientName: "Emily Rodriguez",
        patientId: "PAT-8042",
        patientPhone: "+1 (555) 456-7890",
        patientAvatar: "E",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        durationMinutes: 30,
        status: "REQUESTED",
        reason: "Initial consultation regarding mild proteinuria symptoms.",
        type: "VIDEO_CALL",
        isNewPatient: true,
        createdAt: "2024-02-25T09:15:00Z"
    },
    {
        id: "APT-5003",
        patientName: "Lisa Thompson",
        patientId: "PAT-8043",
        patientPhone: "+1 (555) 789-0123",
        patientAvatar: "L",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        durationMinutes: 60,
        status: "COMPLETED",
        reason: "Routine dialysis evaluation.",
        type: "IN_PERSON",
        isNewPatient: false,
        createdAt: "2024-02-15T14:20:00Z"
    },
    {
        id: "APT-5004",
        patientName: "Robert Taylor",
        patientId: "PAT-8044",
        patientPhone: "+1 (555) 222-3333",
        patientAvatar: "R",
        scheduledStart: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), // Today 4:00 PM
        durationMinutes: 30,
        status: "CONFIRMED",
        reason: "Discuss AI prediction results indicating high urea levels.",
        type: "VIDEO_CALL",
        isNewPatient: false,
        createdAt: "2024-02-22T11:45:00Z"
    },
    {
        id: "APT-5005",
        patientName: "Alex Jordan",
        patientId: "PAT-8045",
        patientPhone: "+1 (555) 666-7777",
        patientAvatar: "A",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        durationMinutes: 45,
        status: "CONFIRMED",
        reason: "Chronic hypertension monitoring.",
        type: "IN_PERSON",
        isNewPatient: false,
        createdAt: "2024-02-24T16:30:00Z"
    },
    {
        id: "APT-5006",
        patientName: "Thomas Anderson",
        patientId: "PAT-8046",
        patientPhone: "+1 (555) 111-0000",
        patientAvatar: "T",
        scheduledStart: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        durationMinutes: 30,
        status: "REQUESTED",
        reason: "Second opinion on recent lab tests.",
        type: "VIDEO_CALL",
        isNewPatient: true,
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
    if (isToday(date)) return <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-[10px] ml-2 tracking-wider uppercase">Today</span>;
    if (isTomorrow(date)) return <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] ml-2 tracking-wider uppercase">Tomorrow</span>;
    if (isPast(date)) return <span className="text-text-muted font-bold bg-surface px-2 py-0.5 border border-border-light rounded text-[10px] ml-2 tracking-wider uppercase">Past</span>;
    return null;
};

// Calculate if appointment is coming up soon (e.g. within 30 mins)
const isImminent = (dateString: string) => {
    const aptTime = parseISO(dateString);
    const now = new Date();
    if (isPast(aptTime)) return false;
    const diffMins = differenceInMinutes(aptTime, now);
    return diffMins >= 0 && diffMins <= 30;
};

export default function MySchedulePage() {
    // --- State ---
    const [appointments, setAppointments] = useState<AppointmentRecord[]>(mockAppointments);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
    const [typeFilter, setTypeFilter] = useState<ConsultationType | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

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
                apt.patientId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
            const matchesType = typeFilter === "ALL" || apt.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [appointments, searchTerm, statusFilter, typeFilter]);

    // Apply sorting: Upcoming first (closest to now), then past
    const sortedAppointments = useMemo(() => {
        return [...filteredAppointments].sort((a, b) => {
            // For a doctor, it's often best to see Today's remaining appointments first, then tmrw, then past.
            return new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
        });
    }, [filteredAppointments]);

    // Pagination Calculation
    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const paginatedAppointments = sortedAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);

    // Aggregate Stats
    const totalApts = appointments.length;
    const todayAppointments = appointments.filter(a => isToday(parseISO(a.scheduledStart))).length;
    const pendingCount = appointments.filter(a => a.status === "REQUESTED").length;

    // Identify exactly the next appointment
    const upcomingAppointments = [...appointments]
        .filter(a => a.status === "CONFIRMED" && !isPast(parseISO(a.scheduledStart)))
        .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());

    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Schedule & Appointments</h1>
                    <p className="text-text-muted mt-1">Manage your daily clinical itinerary and upcoming virtual consultations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <RefreshCcw className="w-4 h-4" />
                        Sync Calendar
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <CalendarDays className="w-4 h-4" />
                        Availability Matrix
                    </button>
                </div>
            </div>

            {/* Smart Dashboard Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Next Appointment Card (Takes up 1 column but stands out) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Activity className="w-32 h-32" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-white/10">
                                <Clock className="w-3.5 h-3.5" /> Up Next
                            </span>
                        </div>

                        {nextAppointment ? (
                            <>
                                <h2 className="text-2xl font-bold mb-1">{format(parseISO(nextAppointment.scheduledStart), "h:mm a")}</h2>
                                <p className="text-slate-300 text-sm mb-4">in {differenceInMinutes(parseISO(nextAppointment.scheduledStart), new Date())} minutes</p>

                                <div className="border border-white/10 bg-white/5 p-4 rounded-xl flex items-center gap-4 mb-4 backdrop-blur-md">
                                    <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center font-bold text-lg border border-primary/50">
                                        {nextAppointment.patientAvatar}
                                    </div>
                                    <div>
                                        <p className="font-bold flex items-center gap-1.5">{nextAppointment.patientName}</p>
                                        <p className="text-xs text-slate-400">{nextAppointment.type === "VIDEO_CALL" ? "Telehealth Visit" : "In-Person Clinic"}</p>
                                    </div>
                                </div>
                                <button className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${nextAppointment.type === "VIDEO_CALL" ? "bg-indigo-500 hover:bg-indigo-400" : "bg-white text-slate-900 hover:bg-slate-100"}`}>
                                    {nextAppointment.type === "VIDEO_CALL" ? <Video className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {nextAppointment.type === "VIDEO_CALL" ? "Join Video Call" : "Start Encounter"}
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400">
                                <CheckCircle2 className="w-12 h-12 mb-3 opacity-50" />
                                <p className="font-medium">No upcoming confirmed appointments for today.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Standard Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: "Today's Consults", value: todayAppointments, icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10" },
                        { label: "Pending Requests", value: pendingCount, icon: CalendarDays, color: "text-amber-500", bg: "bg-amber-50" },
                        { label: "Total Tracked", value: totalApts, icon: User, color: "text-emerald-500", bg: "bg-emerald-50" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-2xl border border-border-light shadow-sm flex flex-col justify-between card-hover"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-text-primary mb-1">{stat.value}</h3>
                                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Find Patient by Name or ID..."
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
                                        <option value="REQUESTED">Pending My Approval</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Visit Mode</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value as ConsultationType | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Modes</option>
                                        <option value="IN_PERSON">In-Clinic Visit</option>
                                        <option value="VIDEO_CALL">Virtual Telehealth</option>
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

            {/* Daily Itinerary Layout */}
            <div className="space-y-4">
                <AnimatePresence>
                    {paginatedAppointments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
                            <CalendarX className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-20" />
                            <p className="font-bold text-xl text-text-primary">No appointments scheduled</p>
                            <p className="text-text-secondary mt-1">Adjust your filters or take the rest of the day off.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedAppointments.map((apt) => {
                                const StatusIcon = statusIcons[apt.status];
                                const imminent = isImminent(apt.scheduledStart);

                                return (
                                    <motion.div
                                        key={apt.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`bg-white rounded-2xl border ${imminent && apt.status === 'CONFIRMED' ? 'border-primary shadow-md shadow-primary/10' : 'border-border-light shadow-sm'} overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-md ${apt.status === 'CANCELLED' ? 'opacity-70 grayscale-[50%]' : ''}`}
                                    >
                                        {/* Card Header (Time & Type) */}
                                        <div className={`p-4 border-b border-border-light flex justify-between items-center ${apt.status === 'COMPLETED' ? 'bg-surface/50' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-surface p-2 rounded-lg border border-border-light">
                                                    <Clock className="w-4 h-4 text-text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary text-base">
                                                        {format(parseISO(apt.scheduledStart), "h:mm a")}
                                                    </p>
                                                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
                                                        {format(parseISO(apt.scheduledStart), "MMM d")}
                                                        {getRelativeDay(apt.scheduledStart)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {apt.type === 'VIDEO_CALL' ? (
                                                    <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-indigo-600">
                                                        <Video className="w-4 h-4" /> Telehealth
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-600">
                                                        <MapPin className="w-4 h-4" /> In-Clinic
                                                    </span>
                                                )}
                                                <p className="text-[10px] text-text-muted font-medium mt-0.5">{apt.durationMinutes} min block</p>
                                            </div>
                                        </div>

                                        {/* Card Body (Patient Details) */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                    {apt.patientAvatar}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary flex items-center gap-2">
                                                        {apt.patientName}
                                                        {apt.isNewPatient && (
                                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded-full">New</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border-light w-fit mt-1">{apt.patientId}</p>
                                                </div>
                                            </div>

                                            <div className="bg-surface/50 rounded-xl p-3 border border-border-light mb-auto">
                                                <p className="text-xs text-text-secondary font-medium tracking-wide uppercase mb-1">Chief Complaint / Reason</p>
                                                <p className="text-sm text-text-primary italic line-clamp-2">"{apt.reason}"</p>
                                            </div>
                                        </div>

                                        {/* Card Footer (Actions / Status) */}
                                        <div className="p-4 bg-slate-50 border-t border-border-light mt-auto">
                                            {/* Status Badge */}
                                            <div className="flex justify-between items-center mb-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm ${statusStyles[apt.status]}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {apt.status}
                                                </span>
                                                <button className="text-text-muted hover:text-primary transition-colors" title="View Patient Chart">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Action Buttons entirely dependent on Doctor context */}
                                            <div className="flex gap-2 w-full">
                                                {apt.status === 'REQUESTED' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                                                            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'CANCELLED')}
                                                            className="flex-1 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors shadow-sm"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                )}

                                                {apt.status === 'CONFIRMED' && !isPast(parseISO(apt.scheduledStart)) && (
                                                    <button className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm shadow-sm ${apt.type === "VIDEO_CALL" ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20" : "gradient-primary hover:shadow-primary/30 text-white"}`}>
                                                        {apt.type === "VIDEO_CALL" ? <Video className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        {apt.type === "VIDEO_CALL" ? "Initiate Video Call" : "Start Encounter"}
                                                    </button>
                                                )}

                                                {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED' || (apt.status === 'CONFIRMED' && isPast(parseISO(apt.scheduledStart)))) && (
                                                    <button className="w-full py-2 rounded-xl bg-white border border-border-light text-text-secondary hover:bg-surface text-sm font-medium transition-colors">
                                                        View Outcome Details
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${currentPage === idx + 1
                                    ? "gradient-primary text-white shadow-md shadow-primary/20"
                                    : "border border-border-light bg-white text-text-secondary hover:bg-surface"
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
