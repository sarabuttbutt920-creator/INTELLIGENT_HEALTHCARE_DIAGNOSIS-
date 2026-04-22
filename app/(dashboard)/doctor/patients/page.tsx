"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, UserCircle, Activity, AlertTriangle,
    CheckCircle2, Calendar, ChevronLeft, ChevronRight,
    MessageSquare, FileText, BrainCircuit, HeartPulse,
    Droplets, Phone, Mail, Plus, Users, X, Clock,
    Stethoscope, TrendingUp, ShieldCheck
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RiskLevel = "HIGH_RISK" | "MODERATE" | "HEALTHY" | "PENDING_SCAN";

interface PatientRecord {
    id: string;
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

const riskStyles: Record<RiskLevel, string> = {
    HIGH_RISK: "bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-200/50",
    MODERATE: "bg-amber-100 text-amber-700 border-amber-200",
    HEALTHY: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING_SCAN: "bg-blue-100 text-blue-700 border-blue-200"
};

const riskLabels: Record<RiskLevel, string> = {
    HIGH_RISK: "Critical / High Risk",
    MODERATE: "Monitor / Moderate",
    HEALTHY: "Normal / Healthy",
    PENDING_SCAN: "Needs AI Eval"
};

const riskIcons: Record<RiskLevel, any> = {
    HIGH_RISK: AlertTriangle,
    MODERATE: Activity,
    HEALTHY: CheckCircle2,
    PENDING_SCAN: BrainCircuit
};

// EHR Chart Modal
function EHRModal({ patient, onClose }: { patient: PatientRecord; onClose: () => void }) {
    const [encounterData, setEncounterData] = useState<any>(null);
    const [loadingChart, setLoadingChart] = useState(true);

    useEffect(() => {
        const patientIdNum = patient.id.replace('PAT-', '');
        fetch(`/api/doctor/encounters?patientId=${patientIdNum}`)
            .then(r => r.json())
            .then(d => {
                if (d.success && d.encounters) {
                    setEncounterData(d.encounters[0] || null);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingChart(false));
    }, [patient.id]);

    const RIcon = riskIcons[patient.riskStatus];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Transparent blurred bg */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-border-light max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Gradient */}
                    <div className="gradient-primary p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-50" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white shadow-xl border border-white/20">
                                {patient.avatar}
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-black">{patient.fullName}</h2>
                                <p className="text-white/80 text-sm font-mono mt-0.5">{patient.id}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                                        {patient.age} yrs · {patient.gender}
                                    </span>
                                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                                        <Droplets className="w-3 h-3" /> {patient.bloodType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Risk Status */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border-light bg-surface/50">
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">AI Triage Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${riskStyles[patient.riskStatus]}`}>
                                    <RIcon className="w-4 h-4" />
                                    {riskLabels[patient.riskStatus]}
                                </span>
                            </div>
                            {patient.primaryCondition && (
                                <div className="text-right">
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Primary Condition</p>
                                    <p className="font-semibold text-text-primary flex items-center gap-1.5 justify-end">
                                        <HeartPulse className="w-4 h-4 text-primary" />
                                        {patient.primaryCondition}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-border-light bg-white">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Contact Information</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-primary shrink-0" />
                                        <span className="font-medium text-text-primary">{patient.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-primary shrink-0" />
                                        <span className="font-medium text-text-primary truncate">{patient.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-border-light bg-white">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Appointment Timeline</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-text-muted shrink-0" />
                                        <span className="text-text-secondary">Last seen: <span className="font-semibold text-text-primary">
                                            {formatDistanceToNow(parseISO(patient.lastVisit))} ago
                                        </span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="text-text-secondary">Next: <span className="font-semibold text-text-primary">
                                            {patient.nextAppointment
                                                ? format(parseISO(patient.nextAppointment), "MMM d, h:mm a")
                                                : 'Not scheduled'}
                                        </span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Encounter Data */}
                        {loadingChart ? (
                            <div className="p-6 rounded-2xl border border-border-light bg-surface/30 flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-text-muted">Loading clinical data...</span>
                            </div>
                        ) : encounterData ? (
                            <div className="p-4 rounded-2xl border border-border-light bg-white">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <BrainCircuit className="w-4 h-4 text-primary" />
                                    Latest Encounter Biomarkers
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Blood Pressure", value: encounterData.keyBiomarkers?.bloodPressure, unit: "mmHg" },
                                        { label: "Serum Creatinine", value: encounterData.keyBiomarkers?.serumCreatinine, unit: "mg/dL" },
                                        { label: "Blood Urea", value: encounterData.keyBiomarkers?.bloodUrea, unit: "mg/dL" },
                                        { label: "Hemoglobin", value: encounterData.keyBiomarkers?.hemoglobin, unit: "g/dL" },
                                    ].map(b => (
                                        <div key={b.label} className="bg-surface p-3 rounded-xl border border-border-light text-center">
                                            <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">{b.label}</p>
                                            <p className="text-base font-bold text-text-primary">{b.value || 'N/A'}</p>
                                            <p className="text-[9px] text-text-muted mt-0.5">{b.unit}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${
                                    encounterData.aiResult === 'CKD_DETECTED' ? 'bg-rose-50 border-rose-200' :
                                    encounterData.aiResult === 'NOT_CKD' ? 'bg-emerald-50 border-emerald-200' :
                                    'bg-amber-50 border-amber-200'
                                }`}>
                                    <BrainCircuit className={`w-5 h-5 ${
                                        encounterData.aiResult === 'CKD_DETECTED' ? 'text-rose-500' :
                                        encounterData.aiResult === 'NOT_CKD' ? 'text-emerald-500' : 'text-amber-500'
                                    }`} />
                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Prediction</p>
                                        <p className="font-bold text-sm">{encounterData.aiResult?.replace('_', ' ')} · {encounterData.aiConfidence}% confidence</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl border border-dashed border-border-light text-center">
                                <Stethoscope className="w-8 h-8 text-text-muted opacity-30 mx-auto mb-2" />
                                <p className="text-sm text-text-muted">No encounter data available yet</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link
                                href="/doctor/encounters"
                                className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                            >
                                <BrainCircuit className="w-4 h-4" /> View Encounters
                            </Link>
                            <Link
                                href="/doctor/chat"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light text-text-secondary rounded-xl font-semibold text-sm hover:border-primary/30 hover:text-primary transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" /> Secure Message
                            </Link>
                            <Link
                                href="/doctor/notes"
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-colors"
                            >
                                <FileText className="w-4 h-4" /> Add Note
                            </Link>
                            <Link
                                href="/doctor/appointments"
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-colors"
                            >
                                <Calendar className="w-4 h-4" /> Schedule
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function DoctorPatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/doctor/patients");
            const data = await res.json();
            if (data.success && data.patients) {
                setPatients(data.patients);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

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

    const sortedPatients = useMemo(() => {
        const priority: Record<RiskLevel, number> = { HIGH_RISK: 0, PENDING_SCAN: 1, MODERATE: 2, HEALTHY: 3 };
        return [...filteredPatients].sort((a, b) => {
            if (priority[a.riskStatus] !== priority[b.riskStatus]) return priority[a.riskStatus] - priority[b.riskStatus];
            return a.fullName.localeCompare(b.fullName);
        });
    }, [filteredPatients]);

    const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
    const paginatedPatients = sortedPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filterKey = `${searchTerm}-${riskFilter}`;
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
    if (filterKey !== prevFilterKey) { setPrevFilterKey(filterKey); setCurrentPage(1); }

    const [renderTime] = useState(() => Date.now());
    const totalPatientsCount = patients.length;
    const highRiskCount = patients.filter(p => p.riskStatus === "HIGH_RISK").length;
    const pendingScansCount = patients.filter(p => p.riskStatus === "PENDING_SCAN").length;
    const returningThisWeek = patients.filter(p => p.nextAppointment && (new Date(p.nextAppointment).getTime() - renderTime < 7 * 24 * 60 * 60 * 1000) && new Date(p.nextAppointment).getTime() > renderTime).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-muted text-sm font-medium">Loading patient registry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* EHR Modal */}
            {selectedPatient && (
                <EHRModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical Patient Registry</h1>
                    <p className="text-text-muted mt-1">Manage cases, review AI diagnostics, and track patient health vectors.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <TrendingUp className="w-4 h-4" />
                        Analytics
                    </button>
                    <Link href="/doctor/appointments" className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Plus className="w-4 h-4" />
                        New Appointment
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "My Total Cohort", value: totalPatientsCount, icon: Users, color: "text-blue-500", bg: "bg-blue-50", filter: "ALL" as const },
                    { label: "High Risk Alerts", value: highRiskCount, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50", filter: "HIGH_RISK" as const },
                    { label: "Awaiting AI Eval", value: pendingScansCount, icon: BrainCircuit, color: "text-indigo-500", bg: "bg-indigo-50", filter: "PENDING_SCAN" as const },
                    { label: "Active Follow-ups", value: returningThisWeek, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50", filter: "ALL" as const },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setRiskFilter(stat.filter)}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between card-hover cursor-pointer relative overflow-hidden hover:border-primary/20 transition-colors"
                    >
                        <div>
                            <p className="text-sm font-medium text-text-muted mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        {stat.label === "High Risk Alerts" && stat.value > 0 && (
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500 animate-pulse" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
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
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || riskFilter !== "ALL" ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}
                    >
                        <Filter className="w-4 h-4" />
                        Clinical Filters
                        {riskFilter !== "ALL" && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
                    </button>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-border-light">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">AI Triaged Risk Factor</label>
                                <div className="flex flex-wrap gap-2">
                                    {(["ALL", "HIGH_RISK", "MODERATE", "PENDING_SCAN", "HEALTHY"] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setRiskFilter(f === "ALL" ? "ALL" : f as RiskLevel)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                                riskFilter === f
                                                    ? f === "ALL" ? "bg-slate-800 text-white border-slate-800"
                                                    : f === "HIGH_RISK" ? "bg-rose-600 text-white border-rose-600"
                                                    : f === "MODERATE" ? "bg-amber-500 text-white border-amber-600"
                                                    : f === "PENDING_SCAN" ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-emerald-600 text-white border-emerald-600"
                                                    : "bg-white text-text-secondary border-border-light hover:bg-surface"
                                            }`}
                                        >
                                            {f === "ALL" ? "All Registry" : f === "HIGH_RISK" ? "Critical CKD" : f === "MODERATE" ? "Monitor" : f === "PENDING_SCAN" ? "Eval Required" : "Healthy"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Patient Grid */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {paginatedPatients.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm"
                        >
                            <Users className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-20" />
                            <p className="font-bold text-xl text-text-primary">No patients found</p>
                            <p className="text-text-secondary mt-1">Adjust your clinical filters or try a different search.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {paginatedPatients.map((pt, i) => {
                                const RIcon = riskIcons[pt.riskStatus];
                                const RLabel = riskLabels[pt.riskStatus];

                                return (
                                    <motion.div
                                        key={pt.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`bg-white rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col ${pt.riskStatus === 'HIGH_RISK' ? 'border-rose-200 shadow-rose-50' : 'border-border-light'}`}
                                    >
                                        {/* Card Header */}
                                        <div className="p-5 flex gap-4 border-b border-border-light relative">
                                            {pt.riskStatus === 'HIGH_RISK' && (
                                                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold py-1 w-24 text-center tracking-widest uppercase transform rotate-45 translate-x-7 -translate-y-3.5 shadow-sm">
                                                        URGENT
                                                    </div>
                                                </div>
                                            )}
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 gradient-primary text-white">
                                                {pt.avatar}
                                            </div>
                                            <div className="flex-1 pt-1 pr-6">
                                                <h3 className="font-bold text-text-primary text-lg leading-tight">{pt.fullName}</h3>
                                                <p className="font-mono text-xs text-text-muted">{pt.id}</p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                                                    <span className="flex items-center gap-1.5 text-text-secondary font-medium text-xs">
                                                        <UserCircle className="w-3.5 h-3.5 text-text-muted" /> {pt.age} yrs · {pt.gender}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-text-secondary font-medium text-xs">
                                                        <Droplets className="w-3.5 h-3.5 text-rose-400" /> {pt.bloodType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medical Info */}
                                        <div className="px-5 py-4 bg-surface/30 grid grid-cols-2 gap-3">
                                            <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border border-border-light bg-white">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted mb-1">AI Status</p>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold border tracking-widest uppercase ${riskStyles[pt.riskStatus]}`}>
                                                        <RIcon className="w-3.5 h-3.5" />
                                                        {RLabel}
                                                    </span>
                                                </div>
                                                {pt.primaryCondition && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted mb-1">Condition</p>
                                                        <span className="text-xs font-semibold text-text-primary flex items-center justify-end gap-1">
                                                            <HeartPulse className="w-3.5 h-3.5 text-primary" />
                                                            {pt.primaryCondition}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-xs text-text-muted font-medium mb-1">Next Appointment</p>
                                                {pt.nextAppointment ? (
                                                    <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                        {format(parseISO(pt.nextAppointment), "MMM d, h:mm a")}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-medium text-text-secondary italic">Not Scheduled</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted font-medium mb-1">Last Seen</p>
                                                <p className="text-sm font-medium text-text-secondary">
                                                    {formatDistanceToNow(parseISO(pt.lastVisit))} ago
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="border-t border-border-light p-4 bg-white grid grid-cols-4 gap-2 mt-auto">
                                            <button
                                                onClick={() => setSelectedPatient(pt)}
                                                className="col-span-2 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl text-sm transition-colors border border-primary/20"
                                            >
                                                <FileText className="w-4 h-4" /> View Chart (EHR)
                                            </button>

                                            <Link
                                                href="/doctor/encounters"
                                                className={`col-span-1 flex items-center justify-center py-2 rounded-xl text-white transition-colors shadow-sm text-sm ${pt.riskStatus === 'PENDING_SCAN' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/20'}`}
                                                title="Run KidneyNet AI Inference"
                                            >
                                                <BrainCircuit className="w-4 h-4" />
                                            </Link>

                                            <Link
                                                href="/doctor/chat"
                                                className="col-span-1 flex items-center justify-center py-2 border border-border-light rounded-xl text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                                                title="Secure Message Patient"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </Link>
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
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${currentPage === idx + 1 ? "gradient-primary text-white shadow-md shadow-primary/20" : "border border-border-light bg-white text-text-secondary hover:bg-surface"}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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
