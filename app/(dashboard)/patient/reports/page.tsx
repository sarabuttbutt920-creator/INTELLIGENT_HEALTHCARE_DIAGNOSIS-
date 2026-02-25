"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    TestTube,
    BrainCircuit,
    Pill,
    Stethoscope,
    Calendar,
    UserCircle,
    ChevronDown,
    AlertTriangle,
    CheckCircle2,
    Share2,
    Clock,
    Lock,
    Printer,
    FileArchive
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

// --- Types ---
type ReportCategory = "LAB_RESULT" | "AI_INFERENCE" | "PRESCRIPTION" | "CLINICAL_NOTE";

interface MedicalReport {
    id: string;
    title: string;
    category: ReportCategory;
    date: string;
    doctorName: string;
    isRead: boolean;
    fileSize: string;
    summary?: string;
    highlight?: {
        label: string;
        value: string;
        isAbnormal: boolean;
    };
}

// --- Mock Data ---
const mockReports: MedicalReport[] = [
    {
        id: "REP-9921",
        title: "Comprehensive Metabolic Panel (CMP)",
        category: "LAB_RESULT",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        doctorName: "Dr. Sarah Jenkins",
        isRead: false,
        fileSize: "1.2 MB",
        summary: "Routine blood work analyzing kidney function, blood sugar, and electrolyte and fluid balance.",
        highlight: { label: "eGFR", value: "48 mL/min", isAbnormal: true }
    },
    {
        id: "REP-9920",
        title: "KidneyNet Prediction Summary",
        category: "AI_INFERENCE",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        doctorName: "KidneyNet Engine (Auto)",
        isRead: true,
        fileSize: "450 KB",
        summary: "Automated inference result based on recent vitals and urinalysis inputs. Flagged for review.",
        highlight: { label: "CKD Risk", value: "Elevated", isAbnormal: true }
    },
    {
        id: "REP-9919",
        title: "Nephrology Consultation Notes",
        category: "CLINICAL_NOTE",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        doctorName: "Dr. Sarah Jenkins",
        isRead: true,
        fileSize: "850 KB",
        summary: "Detailed notes from telehealth visit regarding dietary sodium restrictions and new prescription plan."
    },
    {
        id: "REP-9918",
        title: "Lisinopril 10mg - Prescription",
        category: "PRESCRIPTION",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        doctorName: "Dr. Sarah Jenkins",
        isRead: true,
        fileSize: "320 KB",
        summary: "Updated prescription script for hypertension management. Valid for 6 refills."
    },
    {
        id: "REP-9917",
        title: "Urinalysis (Complete)",
        category: "LAB_RESULT",
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        doctorName: "LabCorp Analytics",
        isRead: true,
        fileSize: "1.5 MB",
        summary: "Full urinalysis test checking for protein, blood cells, and bacteria in urine.",
        highlight: { label: "Albumin", value: "Normal", isAbnormal: false }
    }
];

// --- Helpers ---
const categoryStyles = {
    LAB_RESULT: "bg-blue-100 text-blue-700 border-blue-200",
    AI_INFERENCE: "bg-purple-100 text-purple-700 border-purple-200",
    PRESCRIPTION: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLINICAL_NOTE: "bg-amber-100 text-amber-700 border-amber-200"
};

const categoryIcons = {
    LAB_RESULT: TestTube,
    AI_INFERENCE: BrainCircuit,
    PRESCRIPTION: Pill,
    CLINICAL_NOTE: Stethoscope
};

const categoryLabels = {
    LAB_RESULT: "Lab Result",
    AI_INFERENCE: "AI Diagnostic",
    PRESCRIPTION: "Prescription",
    CLINICAL_NOTE: "Clinical Note"
};

export default function PatientReportsPage() {
    // --- State ---
    const [reports, setReports] = useState<MedicalReport[]>(mockReports);
    const [activeReportId, setActiveReportId] = useState<string | null>(mockReports[0].id);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<ReportCategory | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Derived Data
    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "ALL" || r.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [reports, searchTerm, filterCategory]);

    const activeReport = reports.find(r => r.id === activeReportId);

    // Stats
    const totalReports = reports.length;
    const unreadCount = reports.filter(r => !r.isRead).length;

    // Handle Mark as Read
    const handleReportClick = (id: string) => {
        setActiveReportId(id);
        setReports(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
    };

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Medical Records</h1>
                    <p className="text-text-muted mt-1">Access your encrypted lab results, clinical notes, and AI inferences securely.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <Share2 className="w-4 h-4" />
                        Share Records
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <FileArchive className="w-4 h-4" />
                        Request Full EHR Archive
                    </button>
                </div>
            </div>

            {/* Smart Summary Banner */}
            <div className="bg-white rounded-3xl border border-border-light p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
                        <FileText className="w-7 h-7" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-text-primary">EHR Document Vault</h3>
                        <p className="text-sm font-medium text-text-secondary">
                            {totalReports} Total Documents • <span className={unreadCount > 0 ? "text-rose-600 font-bold" : "text-emerald-600"}>{unreadCount} Unread Reports</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-text-muted bg-surface py-2 px-4 rounded-xl border border-border-light">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    HIPAA EXTERNALLY AUDITED
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)] min-h-[700px]">

                {/* Left Side: Document Browser */}
                <div className="bg-white rounded-3xl border border-border-light shadow-sm flex flex-col overflow-hidden h-full">

                    {/* Filters & Search */}
                    <div className="p-4 border-b border-border-light bg-slate-50/50 space-y-3 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search document titles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border-light rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                            <button
                                onClick={() => setFilterCategory("ALL")}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filterCategory === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                            >
                                All Records
                            </button>
                            <button
                                onClick={() => setFilterCategory("LAB_RESULT")}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${filterCategory === "LAB_RESULT" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                            >
                                <TestTube className="w-3.5 h-3.5" /> Labs
                            </button>
                            <button
                                onClick={() => setFilterCategory("AI_INFERENCE")}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${filterCategory === "AI_INFERENCE" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                            >
                                <BrainCircuit className="w-3.5 h-3.5" /> Predictions
                            </button>
                        </div>
                    </div>

                    {/* Report List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {filteredReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-text-muted">
                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-semibold">No documents found.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredReports.map((report) => {
                                    const Icon = categoryIcons[report.category];
                                    const isActive = activeReportId === report.id;

                                    return (
                                        <motion.button
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={report.id}
                                            onClick={() => handleReportClick(report.id)}
                                            className={`w-full text-left p-4 mb-2 rounded-2xl border transition-all flex flex-col gap-3 relative ${isActive
                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                    : "bg-white border-transparent hover:border-border-light hover:bg-surface"
                                                }`}
                                        >
                                            {!report.isRead && (
                                                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-sm" />
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${categoryStyles[report.category]}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className={`font-bold text-sm truncate leading-tight ${!report.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>{report.title}</h4>
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">{format(parseISO(report.date), "MMM d, yyyy")}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-light/50">
                                                <p className="text-xs text-text-muted truncate flex items-center gap-1 font-medium"><UserCircle className="w-3 h-3" /> {report.doctorName}</p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right Side: Document Viewer */}
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-border-light shadow-xl flex flex-col overflow-hidden relative text-white">
                    {/* Header Action Bar */}
                    <div className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
                        {activeReport ? (
                            <>
                                <div className="flex items-center gap-3 w-2/3">
                                    <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <h2 className="font-bold text-sm truncate">{activeReport.title}</h2>
                                    <span className="text-[10px] font-mono text-slate-400 border border-slate-700 bg-slate-800 px-1.5 py-0.5 rounded ml-2 shrink-0">{activeReport.fileSize}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title="Print Document">
                                        <Printer className="w-5 h-5" />
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md transition-colors">
                                        <Download className="w-4 h-4" /> Save PDF
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-semibold text-slate-400">Select a document to view</div>
                        )}
                    </div>

                    {/* The "PDF" Mock Background View */}
                    <div className="flex-1 bg-slate-800 overflow-y-auto custom-scrollbar p-6 md:p-10 relative flex justify-center">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />

                        {activeReport ? (
                            <motion.div
                                key={activeReport.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full max-w-2xl bg-white text-slate-900 shadow-2xl min-h-[800px] p-10 relative"
                            >
                                {/* Medical Header Format */}
                                <div className="border-b-2 border-slate-200 pb-6 mb-8 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">MediIntel</h1>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Official Clinical Record</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-700">Date of Record: {format(parseISO(activeReport.date), "MMMM d, yyyy")}</p>
                                        <p className="text-xs text-slate-500 font-mono mt-1">Document ID: {activeReport.id}</p>
                                    </div>
                                </div>

                                {/* Patient Info Standard Block */}
                                <div className="bg-slate-50 p-4 border border-slate-200 mb-8 rounded-lg flex justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Patient Subject</p>
                                        <p className="font-bold text-slate-800">Michael Chen</p>
                                        <p className="text-xs font-mono text-slate-600 mt-0.5">ID: PAT-8041</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Authorizing Provider</p>
                                        <p className="font-bold text-slate-800">{activeReport.doctorName}</p>
                                        <p className="text-xs font-mono text-slate-600 mt-0.5">Role: Nephrology Dept.</p>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">{activeReport.title}</h2>
                                <div className="space-y-6">
                                    <p className="text-slate-700 leading-relaxed text-sm">
                                        {activeReport.summary}
                                    </p>

                                    {/* Mock Highlight Box */}
                                    {activeReport.highlight && (
                                        <div className={`p-5 rounded-xl border ${activeReport.highlight.isAbnormal ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                            <div className="flex items-center gap-3">
                                                {activeReport.highlight.isAbnormal ? (
                                                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                                                ) : (
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                                )}
                                                <div>
                                                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${activeReport.highlight.isAbnormal ? 'text-rose-600' : 'text-emerald-700'}`}>Clinical Flag: {activeReport.highlight.label}</p>
                                                    <h4 className={`text-2xl font-black ${activeReport.highlight.isAbnormal ? 'text-rose-900' : 'text-emerald-900'}`}>{activeReport.highlight.value}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Filler Line text to make it look like a document */}
                                    <div className="pt-8 space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="space-y-2">
                                                <div className="w-full h-3 bg-slate-100 rounded"></div>
                                                <div className="w-5/6 h-3 bg-slate-100 rounded"></div>
                                                <div className="w-4/6 h-3 bg-slate-100 rounded"></div>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                                {/* Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-5 pointer-events-none">
                                    <h1 className="text-8xl font-black uppercase text-slate-900">CONFIDENTIAL</h1>
                                    <h2 className="text-4xl font-bold text-center mt-2 tracking-widest">PATIENT RECORD</h2>
                                </div>

                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center max-w-sm">
                                <div className="w-24 h-24 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center mb-6 shadow-inner">
                                    <Eye className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Secure Viewer Engine</h3>
                                <p className="text-sm">Select a medical document from the left-hand navigation pane to load and decrypt its contents natively within the browser.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
