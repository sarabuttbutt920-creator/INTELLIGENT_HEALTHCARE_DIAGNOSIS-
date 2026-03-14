"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Search,
    Download,
    Eye,
    TestTube,
    BrainCircuit,
    Pill,
    Stethoscope,
    UserCircle,
    AlertTriangle,
    CheckCircle2,
    Share2,
    Lock,
    Printer,
    FileArchive,
    Plus,
    Trash2,
    Edit3,
    X,
    Save
} from "lucide-react";
import { format, parseISO } from "date-fns";

// --- Types ---
type ReportCategory = "LAB_RESULT" | "AI_INFERENCE" | "PRESCRIPTION" | "CLINICAL_NOTE" | "OTHER";

interface MedicalReport {
    id: string;
    title: string;
    category: ReportCategory;
    date: string;
    doctorName: string;
    isRead: boolean;
    fileSize: string;
    summary?: string;
    recommendations?: string;
    highlight?: {
        label: string;
        value: string;
        isAbnormal: boolean;
    };
    deleteable?: boolean;
}

// --- Helpers ---
const categoryStyles: Record<ReportCategory, string> = {
    LAB_RESULT: "bg-blue-100 text-blue-700 border-blue-200",
    AI_INFERENCE: "bg-purple-100 text-purple-700 border-purple-200",
    PRESCRIPTION: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLINICAL_NOTE: "bg-amber-100 text-amber-700 border-amber-200",
    OTHER: "bg-slate-100 text-slate-700 border-slate-200"
};

const categoryIcons: Record<ReportCategory, any> = {
    LAB_RESULT: TestTube,
    AI_INFERENCE: BrainCircuit,
    PRESCRIPTION: Pill,
    CLINICAL_NOTE: Stethoscope,
    OTHER: FileText
};

export default function PatientReportsPage() {
    // --- State ---
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [activeReportId, setActiveReportId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<ReportCategory | "ALL">("ALL");
    const [loading, setLoading] = useState(true);

    // CRUD Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newReportDraft, setNewReportDraft] = useState({ summary: "", recommendations: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editDraft, setEditDraft] = useState({ summary: "", recommendations: "" });

    // Fetch initial data
    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/patient/reports');
            const data = await res.json();
            if (data.success) {
                setReports(data.reports);
                if (!activeReportId && data.reports.length > 0) {
                    setActiveReportId(data.reports[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleReportClick = (id: string) => {
        setActiveReportId(id);
        setIsEditMode(false);
        setReports(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
    };

    // --- CRUD API Calls ---
    const handleAddReport = async () => {
        if (!newReportDraft.summary.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/patient/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReportDraft)
            });
            const data = await res.json();
            if (data.success) {
                await fetchReports();
                setIsAddModalOpen(false);
                setNewReportDraft({ summary: "", recommendations: "" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleEdit = () => {
        if (!activeReport) return;
        if (isEditMode) {
            setIsEditMode(false);
        } else {
            setEditDraft({ summary: activeReport.summary || "", recommendations: activeReport.recommendations || "" });
            setIsEditMode(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!activeReport) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/patient/reports/${activeReport.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editDraft)
            });
            const data = await res.json();
            if (data.success) {
                await fetchReports();
                setIsEditMode(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!activeReport) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this custom report?");
        if (!confirmDelete) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/patient/reports/${activeReport.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setActiveReportId(null);
                await fetchReports();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
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
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border-light text-primary rounded-xl shadow-sm hover:bg-slate-50 transition-colors font-bold text-sm">
                        <Plus className="w-5 h-5" />
                        Add Record
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <FileArchive className="w-4 h-4" />
                        Request Archive
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
                            <button
                                onClick={() => setFilterCategory("OTHER")}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${filterCategory === "OTHER" ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                            >
                                <FileText className="w-3.5 h-3.5" /> Custom
                            </button>
                        </div>
                    </div>

                    {/* Report List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {loading ? (
                            <div className="flex items-center justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                        ) : filteredReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-text-muted">
                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-semibold">No documents found.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredReports.map((report) => {
                                    const Icon = categoryIcons[report.category] || FileText;
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
                                    {activeReport.deleteable && (
                                        <>
                                            <button onClick={handleDelete} disabled={isSubmitting} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-300 hover:text-rose-400 transition-colors" title="Delete Form">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button onClick={handleToggleEdit} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title={isEditMode ? "Cancel Edit" : "Edit Form"}>
                                                {isEditMode ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                                            </button>
                                        </>
                                    )}
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
                                key={activeReport.id + (isEditMode ? '-edit' : '')}
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
                                        <p className="text-xs text-slate-500 font-mono mt-1">Document ID: {activeReport.id.substring(0, 16)}</p>
                                    </div>
                                </div>

                                {/* Patient Info Standard Block */}
                                <div className="bg-slate-50 p-4 border border-slate-200 mb-8 rounded-lg flex justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Patient Subject</p>
                                        <p className="font-bold text-slate-800">You</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Authorizing Provider</p>
                                        <p className="font-bold text-slate-800">{activeReport.doctorName}</p>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">{activeReport.title} {isEditMode && " (Edit Mode)"}</h2>
                                <div className="space-y-6">
                                    {isEditMode ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-1 block">Clinical Summary</label>
                                                <textarea
                                                    value={editDraft.summary}
                                                    onChange={(e) => setEditDraft({ ...editDraft, summary: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary text-sm min-h-[150px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-1 block">Recommendations</label>
                                                <textarea
                                                    value={editDraft.recommendations}
                                                    onChange={(e) => setEditDraft({ ...editDraft, recommendations: e.target.value })}
                                                    placeholder="Add any specific steps or tasks here..."
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary text-sm min-h-[100px]"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                            >
                                                <Save className="w-5 h-5" />
                                                {isSubmitting ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Clinical Summary / Details</label>
                                                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap flex-1 min-h-[50px] bg-slate-50 p-4 border border-slate-100 rounded-xl">
                                                    {activeReport.summary}
                                                </p>
                                            </div>

                                            {activeReport.recommendations && activeReport.recommendations.trim().length > 0 && (
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Recommendations & Next Steps</label>
                                                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap bg-slate-50 p-4 border border-slate-100 rounded-xl">
                                                        {activeReport.recommendations}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Mock Highlight Box */}
                                            {activeReport.highlight && (
                                                <div className={`p-5 rounded-xl border ${activeReport.highlight.isAbnormal ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'} mt-6`}>
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
                                        </>
                                    )}

                                </div>

                                {/* Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-[0.03] pointer-events-none">
                                    <h1 className="text-8xl font-black uppercase text-slate-900">VERIFIED</h1>
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

            {/* Add Report Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 relative"
                        >
                            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Add New Document</h2>
                                    <p className="text-sm text-slate-500">Record a custom self-reported log or summary</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Summary Details</label>
                                    <textarea
                                        value={newReportDraft.summary}
                                        onChange={(e) => setNewReportDraft({ ...newReportDraft, summary: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm min-h-[120px]"
                                        placeholder="Enter the lab details, readings, or a custom self-reported update..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Recommendations (Optional)</label>
                                    <textarea
                                        value={newReportDraft.recommendations}
                                        onChange={(e) => setNewReportDraft({ ...newReportDraft, recommendations: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm min-h-[80px]"
                                        placeholder="Any specific tasks or instructions to follow up on?"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddReport}
                                    disabled={isSubmitting || !newReportDraft.summary.trim()}
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50 transition-all hover:bg-indigo-600"
                                >
                                    {isSubmitting ? "Saving..." : "Save Record"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
