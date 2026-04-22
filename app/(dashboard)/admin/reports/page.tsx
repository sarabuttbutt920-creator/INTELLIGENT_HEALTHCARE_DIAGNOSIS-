"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, FileText, FileSignature, CheckCircle2, Clock, Calendar,
    ChevronLeft, ChevronRight, Download, Eye, Stethoscope, Activity,
    AlertCircle, FileImage, Edit3, Trash2, X, Save, RefreshCcw, Loader2
} from "lucide-react";
import { format } from "date-fns";

type ReportStatus = "PENDING_REVIEW" | "FINALIZED" | "NEEDS_REVISION";
type DiagnosisSeverity = "NORMAL" | "MILD" | "SEVERE" | "CRITICAL";

interface MedicalReport {
    id: string;
    encounterId: string;
    patientName: string;
    patientId: string;
    doctorName: string;
    summary: string;
    recommendations: string;
    severity: DiagnosisSeverity;
    status: ReportStatus;
    hasPdf: boolean;
    pdfUrl?: string | null;
    createdAt: string;
}

const severityStyles: Record<DiagnosisSeverity, string> = {
    NORMAL: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MILD: "bg-blue-100 text-blue-700 border-blue-200",
    SEVERE: "bg-amber-100 text-amber-700 border-amber-200",
    CRITICAL: "bg-rose-100 text-rose-700 border-rose-200"
};

const severityGradients: Record<DiagnosisSeverity, string> = {
    NORMAL: "from-emerald-500 to-teal-600",
    MILD: "from-blue-500 to-indigo-600",
    SEVERE: "from-amber-500 to-orange-600",
    CRITICAL: "from-rose-500 to-red-600"
};

const statusStyles: Record<ReportStatus, string> = {
    FINALIZED: "text-emerald-600 bg-emerald-50 border-emerald-200",
    PENDING_REVIEW: "text-amber-600 bg-amber-50 border-amber-200",
    NEEDS_REVISION: "text-rose-600 bg-rose-50 border-rose-200"
};

export default function ReportsOverviewPage() {
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState<DiagnosisSeverity | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals
    const [viewReport, setViewReport] = useState<MedicalReport | null>(null);
    const [editReport, setEditReport] = useState<MedicalReport | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MedicalReport | null>(null);
    const [editSummary, setEditSummary] = useState("");
    const [editRecommendations, setEditRecommendations] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchReports = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reports?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            if (data.success) {
                setReports(data.reports);
                setTotal(data.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports(currentPage);
    }, [fetchReports, currentPage]);

    const filteredReports = useMemo(() => {
        return reports.filter(rpt => {
            const matchesSearch =
                rpt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rpt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rpt.encounterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rpt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSeverity = severityFilter === "ALL" || rpt.severity === severityFilter;
            const matchesStatus = statusFilter === "ALL" || rpt.status === statusFilter;
            return matchesSearch && matchesSeverity && matchesStatus;
        });
    }, [reports, searchTerm, severityFilter, statusFilter]);

    const totalPages = Math.ceil(total / itemsPerPage);

    const finalizedCount = reports.filter(r => r.status === "FINALIZED").length;
    const criticalCount = reports.filter(r => r.severity === "CRITICAL").length;
    const pdfCount = reports.filter(r => r.hasPdf).length;

    const openEdit = (rpt: MedicalReport) => {
        setEditReport(rpt);
        setEditSummary(rpt.summary);
        setEditRecommendations(rpt.recommendations);
    };

    const handleSave = async () => {
        if (!editReport) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/reports", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId: editReport.id, summary: editSummary, recommendations: editRecommendations })
            });
            if (res.ok) {
                setReports(prev => prev.map(r => r.id === editReport.id ? { ...r, summary: editSummary, recommendations: editRecommendations } : r));
                setEditReport(null);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/reports?id=${deleteTarget.id}`, { method: "DELETE" });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== deleteTarget.id));
                setTotal(t => t - 1);
                setDeleteTarget(null);
            }
        } finally {
            setDeleting(false);
        }
    };

    const downloadCSV = () => {
        const rows = [
            ["Report ID", "Encounter", "Patient", "Doctor", "Severity", "Status", "Date"],
            ...filteredReports.map(r => [r.id, r.encounterId, r.patientName, r.doctorName, r.severity, r.status, format(new Date(r.createdAt), "yyyy-MM-dd")])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = "reports_export.csv";
        a.click();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Medical Reports</h1>
                    <p className="text-text-muted mt-1">Review finalized encounter summaries and clinical recommendations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchReports(currentPage)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Reports", value: total, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Finalized", value: finalizedCount, icon: FileSignature, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Critical Findings", value: criticalCount, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "With PDF", value: pdfCount, icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
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

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search by Patient, Doctor or Report ID..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                    </div>
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || severityFilter !== "ALL" || statusFilter !== "ALL" ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}>
                        <Filter className="w-4 h-4" />
                        Filters
                        {(severityFilter !== "ALL" || statusFilter !== "ALL") && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
                    </button>
                </div>
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Severity</label>
                                    <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as any)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="ALL">All Severities</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="MILD">Mild</option>
                                        <option value="SEVERE">Severe</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</label>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="ALL">All Statuses</option>
                                        <option value="FINALIZED">Finalized</option>
                                        <option value="PENDING_REVIEW">Pending Review</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(severityFilter !== "ALL" || statusFilter !== "ALL") && (
                                        <button onClick={() => { setSeverityFilter("ALL"); setStatusFilter("ALL"); }} className="text-sm text-red-500 font-medium hover:underline">Reset Filters</button>
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
                        <span>Loading reports...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                    <th className="px-6 py-4 font-semibold w-64">Report & Patient</th>
                                    <th className="px-6 py-4 font-semibold">Clinical Summary</th>
                                    <th className="px-6 py-4 font-semibold w-36">Severity</th>
                                    <th className="px-6 py-4 font-semibold w-40">Status</th>
                                    <th className="px-6 py-4 font-semibold w-40">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredReports.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium text-lg text-text-secondary">No reports found</p>
                                            </td>
                                        </tr>
                                    ) : filteredReports.map((rpt) => (
                                        <motion.tr key={rpt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group">
                                            <td className="px-6 py-4 align-top">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-text-primary text-sm">{rpt.patientName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-primary font-medium">{rpt.patientId}</span>
                                                        <span className="text-xs text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border-light">{rpt.id}</span>
                                                    </div>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1">
                                                        <Stethoscope className="w-3.5 h-3.5" />{rpt.doctorName}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-sm align-top">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-text-primary line-clamp-2">
                                                        <span className="font-semibold text-text-secondary mr-1">T/O:</span>{rpt.summary}
                                                    </p>
                                                    <p className="text-xs text-text-muted line-clamp-2 italic border-l-2 border-primary/30 pl-2">
                                                        <span className="font-semibold not-italic text-primary mr-1">Rx:</span>"{rpt.recommendations}"
                                                    </p>
                                                    {rpt.hasPdf && (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                                                            <FileImage className="w-3.5 h-3.5" />PDF Available
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wider ${severityStyles[rpt.severity]}`}>
                                                    <Activity className="w-3 h-3" />{rpt.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 w-fit rounded-md text-[11px] font-bold border ${statusStyles[rpt.status]}`}>
                                                    {rpt.status === "FINALIZED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {rpt.status.replace("_", " ")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                                                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                    {format(new Date(rpt.createdAt), "MMM d, yyyy")}
                                                </div>
                                                <div className="text-xs text-text-muted pl-5 mt-1">{rpt.encounterId}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setViewReport(rpt)} title="View Report"
                                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-primary hover:border-primary/30 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEdit(rpt)} title="Edit Report"
                                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {rpt.hasPdf && rpt.pdfUrl && (
                                                        <a href={rpt.pdfUrl} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button onClick={() => setDeleteTarget(rpt)} title="Delete Report"
                                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
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
                            <span className="font-semibold text-text-primary">{totalPages}</span> — {total} total reports
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                                const page = idx + 1;
                                return (
                                    <button key={idx} onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === page ? "gradient-primary text-white shadow-sm" : "border border-border-light bg-white text-text-secondary hover:bg-surface"}`}>
                                        {page}
                                    </button>
                                );
                            })}
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setViewReport(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className={`bg-linear-to-r ${severityGradients[viewReport.severity]} p-6 text-white`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{viewReport.id}</span>
                                    <button onClick={() => setViewReport(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold">{viewReport.patientName}</h2>
                                <p className="text-white/80 text-sm mt-1">{viewReport.patientId} · {viewReport.encounterId}</p>
                                <div className="flex items-center gap-2 mt-3 text-sm text-white/90">
                                    <Stethoscope className="w-4 h-4" />{viewReport.doctorName}
                                </div>
                            </div>
                            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                                <div className="flex gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${severityStyles[viewReport.severity]}`}>{viewReport.severity}</span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusStyles[viewReport.status]}`}>{viewReport.status.replace("_", " ")}</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">Clinical Summary</h3>
                                    <p className="text-text-secondary text-sm leading-relaxed bg-surface rounded-xl p-4 border border-border-light">{viewReport.summary}</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">Recommendations</h3>
                                    <p className="text-text-secondary text-sm leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">{viewReport.recommendations}</p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-light">
                                    <span>Created: {format(new Date(viewReport.createdAt), "MMM d, yyyy HH:mm")}</span>
                                    {viewReport.hasPdf && <span className="text-blue-600 font-semibold flex items-center gap-1"><FileImage className="w-3.5 h-3.5" />PDF Available</span>}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setEditReport(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-border-light flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">Edit Report</h2>
                                    <p className="text-sm text-text-muted">{editReport.patientName} · {editReport.id}</p>
                                </div>
                                <button onClick={() => setEditReport(null)} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-border-light transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary">Clinical Summary</label>
                                    <textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} rows={4}
                                        className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary">Recommendations</label>
                                    <textarea value={editRecommendations} onChange={e => setEditRecommendations(e.target.value)} rows={3}
                                        className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none outline-none" />
                                </div>
                            </div>
                            <div className="p-6 pt-0 flex gap-3 justify-end">
                                <button onClick={() => setEditReport(null)} className="px-5 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface transition-colors text-sm font-medium">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-md text-sm font-medium disabled:opacity-60">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setDeleteTarget(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5"
                            onClick={e => e.stopPropagation()}>
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto">
                                <Trash2 className="w-7 h-7 text-rose-500" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-text-primary">Delete Report?</h2>
                                <p className="text-sm text-text-muted mt-2">This will permanently remove report <strong>{deleteTarget.id}</strong> for <strong>{deleteTarget.patientName}</strong>. This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface transition-colors text-sm font-medium">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
