"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Activity,
    BrainCircuit,
    Stethoscope,
    FileText,
    CheckCircle2,
    Clock,
    UserCircle,
    HeartPulse,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    Download,
    Eye,
    PenTool
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

// --- Types ---
type EncounterStatus = "DRAFT" | "PENDING_REVIEW" | "SIGNED_OFF";
type AIResult = "CKD_DETECTED" | "NOT_CKD" | "INCONCLUSIVE";

interface ClinicalEncounter {
    id: string; // encounter_id
    patientName: string;
    patientId: string;
    date: string;
    modelUsed: string;
    aiConfidence: number;
    aiResult: AIResult;
    status: EncounterStatus;
    keyBiomarkers: {
        bloodPressure: string;
        specificGravity: string;
        serumCreatinine: string;
        bloodUrea: string;
    };
    doctorNotes?: string;
}

// --- Mock Data ---
const mockEncounters: ClinicalEncounter[] = [
    {
        id: "ENC-10842",
        patientName: "Michael Chen",
        patientId: "PAT-8041",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        modelUsed: "KidneyNet-RF v2.1",
        aiConfidence: 94.5,
        aiResult: "CKD_DETECTED",
        status: "PENDING_REVIEW",
        keyBiomarkers: {
            bloodPressure: "150/90",
            specificGravity: "1.015",
            serumCreatinine: "2.5",
            bloodUrea: "85"
        }
    },
    {
        id: "ENC-10841",
        patientName: "Samantha Hughes",
        patientId: "PAT-8046",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        modelUsed: "KidneyNet-XGB v1.8",
        aiConfidence: 88.2,
        aiResult: "NOT_CKD",
        status: "SIGNED_OFF",
        keyBiomarkers: {
            bloodPressure: "120/80",
            specificGravity: "1.020",
            serumCreatinine: "0.9",
            bloodUrea: "35"
        },
        doctorNotes: "Patient presents normal kidney function. Suggested routine annual checkup."
    },
    {
        id: "ENC-10840",
        patientName: "Robert Taylor",
        patientId: "PAT-8044",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        modelUsed: "KidneyNet-RF v2.1",
        aiConfidence: 97.8,
        aiResult: "CKD_DETECTED",
        status: "SIGNED_OFF",
        keyBiomarkers: {
            bloodPressure: "160/95",
            specificGravity: "1.010",
            serumCreatinine: "4.1",
            bloodUrea: "110"
        },
        doctorNotes: "Stage 4 CKD confirmed. Initiated heavy dietary restriction protocol and referred for dialysis consultation."
    },
    {
        id: "ENC-10839",
        patientName: "Emily Rodriguez",
        patientId: "PAT-8042",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        modelUsed: "KidneyNet-SVM v1.5",
        aiConfidence: 55.4,
        aiResult: "INCONCLUSIVE",
        status: "DRAFT",
        keyBiomarkers: {
            bloodPressure: "135/85",
            specificGravity: "1.015",
            serumCreatinine: "1.2",
            bloodUrea: "45"
        }
    },
    {
        id: "ENC-10838",
        patientName: "Alex Jordan",
        patientId: "PAT-8045",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        modelUsed: "KidneyNet-RF v2.1",
        aiConfidence: 92.1,
        aiResult: "NOT_CKD",
        status: "SIGNED_OFF",
        keyBiomarkers: {
            bloodPressure: "115/75",
            specificGravity: "1.025",
            serumCreatinine: "0.8",
            bloodUrea: "30"
        }
    }
];

// --- Helpers ---
const resultStyles = {
    CKD_DETECTED: "bg-rose-100 text-rose-700 border-rose-200",
    NOT_CKD: "bg-emerald-100 text-emerald-700 border-emerald-200",
    INCONCLUSIVE: "bg-amber-100 text-amber-700 border-amber-200"
};

const resultIcons = {
    CKD_DETECTED: AlertTriangle,
    NOT_CKD: CheckCircle2,
    INCONCLUSIVE: Activity
};

const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING_REVIEW: "bg-indigo-100 text-indigo-700 border-indigo-200",
    SIGNED_OFF: "bg-blue-100 text-blue-700 border-blue-200"
};

const statusLabels = {
    DRAFT: "Draft / Incomplete",
    PENDING_REVIEW: "Awaiting Signature",
    SIGNED_OFF: "Clinician Signed"
};

export default function DoctorEncountersPage() {
    // --- State ---
    const [encounters, setEncounters] = useState<ClinicalEncounter[]>(mockEncounters);
    const [searchTerm, setSearchTerm] = useState("");
    const [resultFilter, setResultFilter] = useState<AIResult | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<EncounterStatus | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Derived Data ---
    const filteredEncounters = useMemo(() => {
        return encounters.filter(enc => {
            const matchesSearch =
                enc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enc.patientId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesResult = resultFilter === "ALL" || enc.aiResult === resultFilter;
            const matchesStatus = statusFilter === "ALL" || enc.status === statusFilter;

            return matchesSearch && matchesResult && matchesStatus;
        });
    }, [encounters, searchTerm, resultFilter, statusFilter]);

    // Apply sorting: Most recent first
    const sortedEncounters = useMemo(() => {
        return [...filteredEncounters].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [filteredEncounters]);

    // Pagination Calculation
    const totalPages = Math.ceil(sortedEncounters.length / itemsPerPage);
    const paginatedEncounters = sortedEncounters.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, resultFilter, statusFilter]);

    // Aggregate Stats
    const totalEncounters = encounters.length;
    const pendingReviews = encounters.filter(e => e.status === "PENDING_REVIEW").length;
    const ckdDetectedRate = Math.round((encounters.filter(e => e.aiResult === "CKD_DETECTED").length / totalEncounters) * 100);
    const draftCount = encounters.filter(e => e.status === "DRAFT").length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical AI Encounters</h1>
                    <p className="text-text-muted mt-1">Review model predictions, verify biomarkers, and sign off on diagnostic reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <FileText className="w-4 h-4" />
                        Generate Batch Report
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <PlayCircle className="w-4 h-4" />
                        New Inference
                    </button>
                </div>
            </div>

            {/* Smart Dashboard Top Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "My Total Encounters", value: totalEncounters, icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Pending Signatures", value: pendingReviews, icon: PenTool, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Draft Inferencing", value: draftCount, icon: Clock, color: "text-slate-500", bg: "bg-slate-100" },
                    { label: "CKD Positive Rate", value: `${ckdDetectedRate}%`, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50" },
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
                        {stat.label === "Pending Signatures" && typeof stat.value === 'number' && stat.value > 0 && (
                            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500 animate-pulse" />
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
                            placeholder="Find Patient by Name, ID, or Encounter Record ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || resultFilter !== "ALL" || statusFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Clinical Filters
                            {(resultFilter !== "ALL" || statusFilter !== "ALL") && (
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
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Prediction Result</label>
                                    <select
                                        value={resultFilter}
                                        onChange={(e) => setResultFilter(e.target.value as AIResult | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Outcomes</option>
                                        <option value="CKD_DETECTED">CKD Positive</option>
                                        <option value="NOT_CKD">Healthy / Normal</option>
                                        <option value="INCONCLUSIVE">Inconclusive Margin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Approval Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as EncounterStatus | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="PENDING_REVIEW">Needs Doctor Approval</option>
                                        <option value="SIGNED_OFF">Completed & Signed</option>
                                        <option value="DRAFT">Saved as Draft</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1 md:col-span-2">
                                    {(resultFilter !== "ALL" || statusFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setResultFilter("ALL");
                                                setStatusFilter("ALL");
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

            {/* Encounters List View */}
            <div className="space-y-4">
                <AnimatePresence>
                    {paginatedEncounters.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
                            <BrainCircuit className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-20" />
                            <p className="font-bold text-xl text-text-primary">No clinical encounters match query</p>
                            <p className="text-text-secondary mt-1">Adjust your filters or initiate a new diagnostic run.</p>
                        </div>
                    ) : (
                        paginatedEncounters.map((enc) => {
                            const RIcon = resultIcons[enc.aiResult];
                            const isPending = enc.status === "PENDING_REVIEW";

                            return (
                                <motion.div
                                    key={enc.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md ${isPending ? 'border-indigo-300 shadow-indigo-500/10' : 'border-border-light'}`}
                                >
                                    {/* Left Sidebar Info (Patient & Status) */}
                                    <div className={`p-5 md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-border-light ${isPending ? 'bg-indigo-50/30' : 'bg-slate-50/50'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-bold border tracking-widest uppercase shadow-sm ${statusStyles[enc.status]}`}>
                                                {statusLabels[enc.status]}
                                            </span>
                                            <span className="text-xs font-mono text-text-muted bg-white border border-border-light px-1.5 py-0.5 rounded shadow-sm">
                                                {enc.id}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2 mt-auto">
                                            <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold shadow-sm">
                                                {enc.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary">{enc.patientName}</p>
                                                <p className="text-xs text-text-muted font-mono">{enc.patientId}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium mt-3">
                                            <Clock className="w-3.5 h-3.5" />
                                            {format(parseISO(enc.date), "MMM d, yyyy 'at' h:mm a")}
                                            <span className="text-text-muted ml-auto hidden xl:block">
                                                ({formatDistanceToNow(parseISO(enc.date))} ago)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Section (AI Inference) */}
                                    <div className="p-5 md:w-1/3 flex flex-col justify-center relative bg-white">
                                        <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted mb-3 flex items-center gap-1.5">
                                            <BrainCircuit className="w-3.5 h-3.5 text-primary" /> Model Diagnostic Output
                                        </p>

                                        <div className={`p-4 rounded-xl border flex items-center gap-3 relative overflow-hidden ${resultStyles[enc.aiResult]}`}>
                                            <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shrink-0">
                                                <RIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight tracking-tight">
                                                    {enc.aiResult.replace("_", " ")}
                                                </h3>
                                                <p className="text-xs font-medium opacity-80 mt-0.5">
                                                    Confidence Metrics: <strong>{enc.aiConfidence}%</strong>
                                                </p>
                                            </div>
                                            {/* Subdued model tag behind */}
                                            <div className="absolute -bottom-2 -right-2 text-4xl opacity-[0.03] font-black uppercase pointer-events-none">
                                                {enc.modelUsed.split(" ")[0]}
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-text-muted mt-2 truncate font-mono bg-surface border border-border-light px-2 py-1 rounded w-fit">
                                            Engine: {enc.modelUsed}
                                        </p>
                                    </div>

                                    {/* Right Section (Biomarkers & Actions) */}
                                    <div className="p-5 md:w-1/3 flex flex-col border-t md:border-t-0 md:border-l border-border-light bg-white">
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-surface p-2 rounded-lg border border-border-light">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-0.5">Blood Press.</p>
                                                <p className="text-sm font-semibold text-text-primary font-mono">{enc.keyBiomarkers.bloodPressure}</p>
                                            </div>
                                            <div className="bg-surface p-2 rounded-lg border border-border-light">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-0.5">Serum Creat.</p>
                                                <p className="text-sm font-semibold text-text-primary font-mono">{enc.keyBiomarkers.serumCreatinine} <span className="text-[10px] text-text-muted">mg/dL</span></p>
                                            </div>
                                            <div className="bg-surface p-2 rounded-lg border border-border-light">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-0.5">Blood Urea</p>
                                                <p className="text-sm font-semibold text-text-primary font-mono">{enc.keyBiomarkers.bloodUrea} <span className="text-[10px] text-text-muted">mg/dL</span></p>
                                            </div>
                                            <div className="bg-surface p-2 rounded-lg border border-border-light">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-0.5">Specific Grav.</p>
                                                <p className="text-sm font-semibold text-text-primary font-mono">{enc.keyBiomarkers.specificGravity}</p>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                                            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 border border-border-light hover:border-primary/20 transition-colors text-xs font-semibold shadow-sm">
                                                <Eye className="w-3.5 h-3.5" /> Full View
                                            </button>
                                            {isPending ? (
                                                <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-semibold shadow-md shadow-indigo-500/20">
                                                    <PenTool className="w-3.5 h-3.5" /> Verify & Sign
                                                </button>
                                            ) : (
                                                <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors text-xs font-semibold shadow-sm">
                                                    <Download className="w-3.5 h-3.5" /> PDF Report
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
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
