"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    UserCircle,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    FileText,
    BrainCircuit,
    HeartPulse,
    Droplets,
    Phone,
    Mail,
    Plus,
    Users
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

// --- Types ---
type RiskLevel = "HIGH_RISK" | "MODERATE" | "HEALTHY" | "PENDING_SCAN";

interface PatientRecord {
    id: string; // patient_id
    fullName: string;
    avatar: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    bloodType: string;
    phone: string;
    email: string;
    lastVisit: string;
    nextAppointment: string | null;
    riskStatus: RiskLevel;
    recentPredictionId?: string;
    primaryCondition?: string;
}

// --- Mock Data ---
const mockPatients: PatientRecord[] = [
    {
        id: "PAT-8041",
        fullName: "Michael Chen",
        avatar: "M",
        age: 62,
        gender: "Male",
        bloodType: "O+",
        phone: "+1 (555) 987-6543",
        email: "michael.chen@email.com",
        lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
        nextAppointment: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(), // Today 2:30 PM
        riskStatus: "HIGH_RISK",
        recentPredictionId: "PRED-9901",
        primaryCondition: "CKD Stage 3a"
    },
    {
        id: "PAT-8042",
        fullName: "Emily Rodriguez",
        avatar: "E",
        age: 45,
        gender: "Female",
        bloodType: "A+",
        phone: "+1 (555) 456-7890",
        email: "emily.r@email.com",
        lastVisit: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(), // ~3 months ago
        nextAppointment: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        riskStatus: "PENDING_SCAN",
        primaryCondition: "Hypertension / Proteinuria"
    },
    {
        id: "PAT-8043",
        fullName: "Lisa Thompson",
        avatar: "L",
        age: 58,
        gender: "Female",
        bloodType: "B-",
        phone: "+1 (555) 789-0123",
        email: "lisa.t@email.com",
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        nextAppointment: null,
        riskStatus: "MODERATE",
        recentPredictionId: "PRED-9904",
        primaryCondition: "Type 2 Diabetes"
    },
    {
        id: "PAT-8044",
        fullName: "Robert Taylor",
        avatar: "R",
        age: 71,
        gender: "Male",
        bloodType: "O-",
        phone: "+1 (555) 222-3333",
        email: "rtaylor@email.com",
        lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), // Today 4:00 PM
        riskStatus: "HIGH_RISK",
        recentPredictionId: "PRED-9888",
        primaryCondition: "CKD Stage 4"
    },
    {
        id: "PAT-8045",
        fullName: "Alex Jordan",
        avatar: "A",
        age: 34,
        gender: "Male",
        bloodType: "AB+",
        phone: "+1 (555) 666-7777",
        email: "ajordan@email.com",
        lastVisit: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        riskStatus: "HEALTHY",
        recentPredictionId: "PRED-8765",
        primaryCondition: "Routine Checkup"
    },
    {
        id: "PAT-8046",
        fullName: "Samantha Hughes",
        avatar: "S",
        age: 41,
        gender: "Female",
        bloodType: "A-",
        phone: "+1 (555) 111-0000",
        email: "sam.hughes@email.com",
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: null,
        riskStatus: "MODERATE",
        primaryCondition: "Elevated Creatinine"
    }
];

// --- Helpers ---
const riskStyles = {
    HIGH_RISK: "bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-200/50",
    MODERATE: "bg-amber-100 text-amber-700 border-amber-200",
    HEALTHY: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING_SCAN: "bg-blue-100 text-blue-700 border-blue-200"
};

const riskLabels = {
    HIGH_RISK: "Critical / High Risk",
    MODERATE: "Monitor / Moderate",
    HEALTHY: "Normal / Healthy",
    PENDING_SCAN: "Needs AI Eval"
};

const riskIcons = {
    HIGH_RISK: AlertTriangle,
    MODERATE: Activity,
    HEALTHY: CheckCircle2,
    PENDING_SCAN: BrainCircuit
};

export default function DoctorPatientsPage() {
    // --- State ---
    const [patients, setPatients] = useState<PatientRecord[]>(mockPatients);
    const [searchTerm, setSearchTerm] = useState("");
    const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust based on grid layout

    // --- Derived Data ---
    const filteredPatients = useMemo(() => {
        return patients.filter(pt => {
            const matchesSearch =
                pt.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (pt.primaryCondition || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRisk = riskFilter === "ALL" || pt.riskStatus === riskFilter;

            return matchesSearch && matchesRisk;
        });
    }, [patients, searchTerm, riskFilter]);

    // Apply sorting: High Risk first, then pending scan, then alphabetical
    const sortedPatients = useMemo(() => {
        const priority = { HIGH_RISK: 0, PENDING_SCAN: 1, MODERATE: 2, HEALTHY: 3 };
        return [...filteredPatients].sort((a, b) => {
            if (priority[a.riskStatus] !== priority[b.riskStatus]) {
                return priority[a.riskStatus] - priority[b.riskStatus];
            }
            return a.fullName.localeCompare(b.fullName);
        });
    }, [filteredPatients]);

    // Pagination Calculation
    const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
    const paginatedPatients = sortedPatients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, riskFilter]);

    // Aggregate Stats
    const totalPatientsCount = patients.length;
    const highRiskCount = patients.filter(p => p.riskStatus === "HIGH_RISK").length;
    const pendingScansCount = patients.filter(p => p.riskStatus === "PENDING_SCAN").length;
    const returningThisWeek = patients.filter(p => p.nextAppointment && (parseISO(p.nextAppointment).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000)).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical Patient Registry</h1>
                    <p className="text-text-muted mt-1">Manage cases, review AI diagnostics, and track patient health vectors.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <UserCircle className="w-4 h-4" />
                        Patient Analytics
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Plus className="w-4 h-4" />
                        Onboard Patient
                    </button>
                </div>
            </div>

            {/* Smart Dashboard Top Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "My Total Cohort", value: totalPatientsCount, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "High Risk Alerts", value: highRiskCount, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "Awaiting AI Eval", value: pendingScansCount, icon: BrainCircuit, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Active Follow-ups", value: returningThisWeek, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between card-hover relative overflow-hidden"
                    >
                        <div>
                            <p className="text-sm font-medium text-text-muted mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary relative z-10">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        {stat.label === "High Risk Alerts" && stat.value > 0 && (
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
                            placeholder="Find Patient by Name, ID, or Condition..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || riskFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Clinical Filters
                            {riskFilter !== "ALL" && (
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
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Triaged Risk Factor</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setRiskFilter("ALL")}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${riskFilter === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                                        >
                                            All Registry
                                        </button>
                                        <button
                                            onClick={() => setRiskFilter("HIGH_RISK")}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${riskFilter === "HIGH_RISK" ? "bg-rose-600 text-white border-rose-600" : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"}`}
                                        >
                                            Critical CKD
                                        </button>
                                        <button
                                            onClick={() => setRiskFilter("MODERATE")}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${riskFilter === "MODERATE" ? "bg-amber-500 text-white border-amber-600" : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"}`}
                                        >
                                            Monitor
                                        </button>
                                        <button
                                            onClick={() => setRiskFilter("PENDING_SCAN")}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${riskFilter === "PENDING_SCAN" ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"}`}
                                        >
                                            Eval Required
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Patient Card Grid */}
            <div className="space-y-4">
                <AnimatePresence>
                    {paginatedPatients.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
                            <Users className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-20" />
                            <p className="font-bold text-xl text-text-primary">No patients found</p>
                            <p className="text-text-secondary mt-1">Adjust your clinical filters or try a different search query.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {paginatedPatients.map((pt) => {
                                const RIcon = riskIcons[pt.riskStatus];
                                const RLabel = riskLabels[pt.riskStatus];

                                return (
                                    <motion.div
                                        key={pt.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`bg-white rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col ${pt.riskStatus === 'HIGH_RISK' ? 'border-rose-200' : 'border-border-light'}`}
                                    >
                                        {/* Top Data Card */}
                                        <div className="p-5 flex gap-4 border-b border-border-light relative">
                                            {/* Top Right Flag */}
                                            {pt.riskStatus === 'HIGH_RISK' && (
                                                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold py-1 w-24 text-center tracking-widest uppercase transform rotate-45 translate-x-[28px] translate-y-[-14px] shadow-sm">
                                                        URGENT
                                                    </div>
                                                </div>
                                            )}

                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 gradient-primary text-white">
                                                {pt.avatar}
                                            </div>
                                            <div className="flex-1 pt-1 pr-6">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="font-bold text-text-primary text-lg leading-tight">{pt.fullName}</h3>
                                                        <p className="font-mono text-xs text-text-muted">{pt.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm">
                                                    <span className="flex items-center gap-1.5 text-text-secondary font-medium"><UserCircle className="w-3.5 h-3.5 text-text-muted" /> {pt.age} yrs • {pt.gender}</span>
                                                    <span className="flex items-center gap-1.5 text-text-secondary font-medium"><Droplets className="w-3.5 h-3.5 text-rose-400" /> Type {pt.bloodType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medical Core Info */}
                                        <div className="px-5 py-4 bg-surface/30 grid grid-cols-2 gap-4">
                                            <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border border-border-light bg-white">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted mb-1">AI Triaged Status</p>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-bold border tracking-widest uppercase ${riskStyles[pt.riskStatus]}`}>
                                                        <RIcon className="w-3.5 h-3.5" />
                                                        {RLabel}
                                                    </span>
                                                </div>
                                                {pt.primaryCondition && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted mb-1">Primary Condition</p>
                                                        <span className="text-sm font-semibold text-text-primary flex items-center justify-end gap-1.5">
                                                            <HeartPulse className="w-4 h-4 text-primary" />
                                                            {pt.primaryCondition}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-xs text-text-muted font-medium mb-1">Next Appointment</p>
                                                {pt.nextAppointment ? (
                                                    <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                                        {format(parseISO(pt.nextAppointment), "MMM d, h:mm a")}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-medium text-text-secondary italic">Not Scheduled</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted font-medium mb-1">Last Seen</p>
                                                <p className="text-sm font-medium text-text-secondary">{formatDistanceToNow(parseISO(pt.lastVisit))} ago</p>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="border-t border-border-light p-4 bg-white grid grid-cols-4 gap-2 mt-auto">

                                            <button className="col-span-2 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl text-sm transition-colors border border-primary/20">
                                                <FileText className="w-4 h-4" /> View Chart (EHR)
                                            </button>

                                            <button
                                                className={`col-span-1 flex items-center justify-center py-2 rounded-xl text-white transition-colors shadow-sm ${pt.riskStatus === 'PENDING_SCAN' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/20'}`}
                                                title="Run KidneyNet AI Inference"
                                            >
                                                <BrainCircuit className="w-4 h-4" />
                                            </button>

                                            <button
                                                className="col-span-1 flex items-center justify-center py-2 border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors"
                                                title="Secure Message"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>

                                        </div>

                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
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
