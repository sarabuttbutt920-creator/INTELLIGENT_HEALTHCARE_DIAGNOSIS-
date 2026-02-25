"use client";

import Link from "next/link";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Video,
    UserCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    Stethoscope,
    Phone,
    FileText,
    ArrowUpRight,
    MoreVertical
} from "lucide-react";
import { format, formatDistanceToNow, parseISO, isPast, isFuture, isToday } from "date-fns";

// --- Types & Mock Data ---
type AppointmentType = "CLINIC" | "TELEHEALTH";
type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface PatientAppointment {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    date: string; // ISO string
    durationMins: number;
    type: AppointmentType;
    status: AppointmentStatus;
    reason: string;
    locationOrLink: string;
    notes?: string;
}

const mockAppointments: PatientAppointment[] = [
    {
        id: "APT-8041-A",
        doctorId: "DOC-102",
        doctorName: "Dr. Sarah Jenkins",
        specialty: "Nephrology Dept.",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // Tomorrow + 4 hours
        durationMins: 30,
        type: "TELEHEALTH",
        status: "SCHEDULED",
        reason: "Follow-up: CKD Stage 3a AI Inference Review",
        locationOrLink: "https://mediintel.health/telehealth/join/APT-8041-A",
        notes: "Please have your latest at-home blood pressure logs ready for reference."
    },
    {
        id: "APT-8041-B",
        doctorId: "DOC-105",
        doctorName: "Dr. Marcus Vance",
        specialty: "General Practice",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        durationMins: 45,
        type: "CLINIC",
        status: "SCHEDULED",
        reason: "Annual Physical Examination",
        locationOrLink: "MediIntel Main Campus, Suite 402\n100 Health Way, CA 94107"
    },
    {
        id: "APT-8041-C",
        doctorId: "DOC-102",
        doctorName: "Dr. Sarah Jenkins",
        specialty: "Nephrology Dept.",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        durationMins: 30,
        type: "CLINIC",
        status: "COMPLETED",
        reason: "Initial Consultation & Lab Review",
        locationOrLink: "MediIntel Main Campus, Suite 405\n100 Health Way, CA 94107",
        notes: "Prescribed Lisinopril 10mg. Scheduled CMP panel for next month."
    },
    {
        id: "APT-8041-D",
        doctorId: "DOC-108",
        doctorName: "Dr. Emily Chen",
        specialty: "Cardiology Dept.",
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        durationMins: 30,
        type: "TELEHEALTH",
        status: "CANCELLED",
        reason: "Routine Heart Rate Check",
        locationOrLink: "https://mediintel.health/telehealth/join/APT-8041-D"
    }
];

export default function PatientAppointmentsPage() {
    // --- State ---
    const [appointments, setAppointments] = useState<PatientAppointment[]>(mockAppointments);
    const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">("UPCOMING");
    const [searchTerm, setSearchTerm] = useState("");

    // --- Derived Data ---
    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [appointments]);

    const upcomingAppointments = sortedAppointments.filter(app => (app.status === "SCHEDULED" && isFuture(parseISO(app.date))) || isToday(parseISO(app.date)));
    const pastAppointments = sortedAppointments.filter(app => app.status !== "SCHEDULED" || isPast(parseISO(app.date)))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Reverse chron for past

    const displayedAppointments = activeTab === "UPCOMING" ? upcomingAppointments : pastAppointments;

    const filteredAppointments = displayedAppointments.filter(app =>
        app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Appointments</h1>
                    <p className="text-text-muted mt-1">Manage your clinical schedule, join telehealth sessions, and book new visits.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary transition-colors shadow-sm font-medium text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        Sync to Calendar
                    </button>
                    <Link href="/patient/book" className="flex items-center gap-2 px-6 py-2.5 gradient-primary text-white rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all font-bold text-sm">
                        <Stethoscope className="w-4 h-4" />
                        Book New Visit
                    </Link>
                </div>
            </div>

            {/* UP NEXT Highlight Card */}
            {activeTab === "UPCOMING" && nextAppointment && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative text-white">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                    <div className="grid grid-cols-1 md:grid-cols-5 p-1">
                        {/* Time & Type Block */}
                        <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest w-fit mb-6">
                                <Clock className="w-3.5 h-3.5" /> Up Next
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                                {format(parseISO(nextAppointment.date), "h:mm")} <span className="text-2xl text-slate-400 font-bold">{format(parseISO(nextAppointment.date), "a")}</span>
                            </h2>
                            <p className="text-lg font-medium text-slate-300 mb-6">
                                {isToday(parseISO(nextAppointment.date)) ? "Today" : format(parseISO(nextAppointment.date), "EEEE, MMMM do")}
                            </p>

                            <div className="mt-auto space-y-3">
                                <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Duration: {nextAppointment.durationMins} Mins
                                </p>
                                <p className={`text-sm font-bold flex items-center gap-2 ${nextAppointment.type === 'TELEHEALTH' ? 'text-indigo-400' : 'text-amber-400'}`}>
                                    {nextAppointment.type === 'TELEHEALTH' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                    {nextAppointment.type === 'TELEHEALTH' ? 'Secure Telehealth Video' : 'In-Person Clinic Visit'}
                                </p>
                            </div>
                        </div>

                        {/* Details & Actions Block */}
                        <div className="md:col-span-3 p-6 md:p-8 relative z-10 flex flex-col justify-center">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                    <UserCircle className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{nextAppointment.doctorName}</h3>
                                    <p className="text-slate-400 font-medium">{nextAppointment.specialty}</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-8">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Reason for Visit</p>
                                <p className="text-slate-200 font-medium text-lg leading-snug">{nextAppointment.reason}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                                {nextAppointment.type === 'TELEHEALTH' ? (
                                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                                        <Video className="w-5 h-5" /> Join Telehealth Session
                                    </button>
                                ) : (
                                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                                        <MapPin className="w-5 h-5" /> Get Directions
                                    </button>
                                )}
                                <button className="px-6 py-3.5 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-xl transition-colors">
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* List Header Controls */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between sticky top-4 z-20">
                {/* Tabs */}
                <div className="flex bg-surface p-1 rounded-xl border border-border-light">
                    <button
                        onClick={() => setActiveTab("UPCOMING")}
                        className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'UPCOMING' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Upcoming & Active
                        <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs">{upcomingAppointments.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("PAST")}
                        className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'PAST' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Past Records
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search provider or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border-light rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Appointments Timeline / List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredAppointments.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl border border-border-light shadow-sm p-12 text-center text-text-muted">
                            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-text-primary mb-2">No {activeTab.toLowerCase()} appointments found</h3>
                            <p className="max-w-md mx-auto">You don't have any {activeTab.toLowerCase()} sessions scheduled right now. Use the "Book New Visit" button to set up a clinical consultation or telehealth review.</p>
                        </motion.div>
                    ) : (
                        filteredAppointments.map((app, index) => {
                            // Skip the first "Up Next" item if viewing Upcoming Tab to avoid duplication directly below
                            if (activeTab === "UPCOMING" && app.id === nextAppointment?.id) return null;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={app.id}
                                    className="bg-white rounded-3xl border border-border-light shadow-sm flex flex-col sm:flex-row overflow-hidden group hover:shadow-md transition-shadow relative"
                                >
                                    {/* Left Status Strip */}
                                    <div className={`w-2 shrink-0 ${app.status === 'CANCELLED' ? 'bg-rose-500' :
                                        app.status === 'COMPLETED' ? 'bg-emerald-500' :
                                            'bg-primary'
                                        }`} />

                                    <div className="p-5 sm:p-6 flex-1 flex flex-col sm:flex-row gap-6 sm:items-center">

                                        {/* Date / Time Block */}
                                        <div className="flex flex-col sm:items-center justify-center shrink-0 sm:w-32 sm:border-r border-border-light sm:pr-6">
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{format(parseISO(app.date), "MMM")}</p>
                                            <p className="text-3xl font-black text-text-primary tracking-tighter leading-none mb-1">{format(parseISO(app.date), "dd")}</p>
                                            <p className="text-sm font-semibold text-text-secondary">{format(parseISO(app.date), "h:mm a")}</p>
                                        </div>

                                        {/* Core Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-text-primary truncate">{app.reason}</h3>
                                                {app.status === 'CANCELLED' && (
                                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 rounded-md border border-rose-100 flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>
                                                )}
                                                {app.status === 'COMPLETED' && (
                                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>
                                                )}
                                            </div>

                                            <p className="text-sm text-text-secondary font-medium mb-3 flex items-center gap-1.5">
                                                <UserCircle className="w-4 h-4 text-text-muted" /> {app.doctorName} <span className="text-text-muted hidden sm:inline">• {app.specialty}</span>
                                            </p>

                                            <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium ${app.type === 'TELEHEALTH' ? 'text-indigo-600 bg-indigo-50/50' : 'text-amber-700 bg-amber-50/50'} p-3 rounded-xl border ${app.type === 'TELEHEALTH' ? 'border-indigo-100' : 'border-amber-100'}`}>
                                                <span className="flex items-center gap-2">
                                                    {app.type === 'TELEHEALTH' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                    {app.type === 'TELEHEALTH' ? 'Telehealth Session' : 'Clinic Visit'}
                                                </span>
                                                <span className="hidden sm:inline text-border-light">|</span>
                                                <span className="text-text-secondary font-normal truncate max-w-sm" title={app.locationOrLink}>
                                                    {app.locationOrLink}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex sm:flex-col gap-2 shrink-0 mt-4 sm:mt-0 justify-end">
                                            {app.status === 'SCHEDULED' && (
                                                <>
                                                    {app.type === 'TELEHEALTH' && (
                                                        <button className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                                            <Video className="w-4 h-4" /> Join Call
                                                        </button>
                                                    )}
                                                    <button className="px-4 py-2 bg-white text-text-secondary border border-border-light hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors shadow-sm text-center">
                                                        Manage
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'COMPLETED' && (
                                                <button className="px-4 py-2 bg-white text-primary border border-primary/20 hover:bg-primary/5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2">
                                                    <FileText className="w-4 h-4" /> View Notes
                                                </button>
                                            )}
                                            <button className="px-2 py-2 text-text-muted hover:text-text-primary bg-white border border-transparent hover:border-border-light rounded-xl transition-colors sm:hidden">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Context Menu Placeholder purely for visual on sm */}
                                    {app.status === 'SCHEDULED' && (
                                        <button className="absolute top-4 right-4 p-1.5 text-text-muted border border-transparent rounded-lg hover:border-border-light hover:bg-surface transition-colors hidden sm:block">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    )}

                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
