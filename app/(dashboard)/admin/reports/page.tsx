"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    FileText,
    FileSignature,
    CheckCircle2,
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Stethoscope,
    Activity,
    AlertCircle,
    Printer,
    Share2,
    FileImage
} from "lucide-react";
import { format } from "date-fns";

// --- Types ---
type ReportStatus = "PENDING_REVIEW" | "FINALIZED" | "NEEDS_REVISION";
type DiagnosisSeverity = "NORMAL" | "MILD" | "SEVERE" | "CRITICAL";

interface MedicalReport {
    id: string; // report_id
    encounterId: string;
    patientName: string;
    patientId: string;
    doctorName: string;
    summary: string;
    recommendations: string;
    severity: DiagnosisSeverity;
    status: ReportStatus;
    hasPdf: boolean;
    pdfSize?: string;
    createdAt: string;
}

// --- Mock Data ---
const mockReports: MedicalReport[] = [
    {
        id: "RPT-10041",
        encounterId: "ENC-5501",
        patientName: "Michael Chen",
        patientId: "PAT-8041",
        doctorName: "Dr. Sarah Jenkins",
        summary: "Patient exhibits clear signs of Stage 3 CKD. Elevated serum creatinine (4.2 mg/dL) and hypertension.",
        recommendations: "Immediate consultation with a dietitian. Start Lisinopril 10mg. Schedule follow-up in 2 weeks.",
        severity: "SEVERE",
        status: "FINALIZED",
        hasPdf: true,
        pdfSize: "1.2 MB",
        createdAt: "2024-02-25T11:45:00Z"
    },
    {
        id: "RPT-10042",
        encounterId: "ENC-5502",
        patientName: "Emily Rodriguez",
        patientId: "PAT-8042",
        doctorName: "Dr. James Wilson",
        summary: "Normal metabolic panel. No indications of chronic kidney disease. Hydration levels are optimal.",
        recommendations: "Maintain current healthy lifestyle. Ensure adequate daily water intake. Next checkup in 12 months.",
        severity: "NORMAL",
        status: "FINALIZED",
        hasPdf: true,
        pdfSize: "0.8 MB",
        createdAt: "2024-02-24T15:30:00Z"
    },
    {
        id: "RPT-10043",
        encounterId: "ENC-5503",
        patientName: "Lisa Thompson",
        patientId: "PAT-8043",
        doctorName: "Dr. Sarah Jenkins",
        summary: "Mild proteinuria detected. AI model flagged as potential early-stage CKD risk. Patient reports fatigue.",
        recommendations: "Needs 24-hour urine collection test. Reduce dietary sodium.",
        severity: "MILD",
        status: "PENDING_REVIEW",
        hasPdf: false,
        createdAt: "2024-02-23T10:15:00Z"
    },
    {
        id: "RPT-10044",
        encounterId: "ENC-5504",
        patientName: "Robert Taylor",
        patientId: "PAT-8044",
        doctorName: "Dr. Emily Rodriguez",
        summary: "Critically high blood urea and potassium levels. AI prediction inconclusive due to incomplete ultrasound data.",
        recommendations: "URGENT: Patient requires immediate hospital admission for potential dialysis evaluation.",
        severity: "CRITICAL",
        status: "FINALIZED",
        hasPdf: true,
        pdfSize: "2.4 MB",
        createdAt: "2024-02-22T17:00:00Z"
    },
    {
        id: "RPT-10045",
        encounterId: "ENC-5505",
        patientName: "Alex Jordan",
        patientId: "PAT-8045",
        doctorName: "Dr. Hassan Ali",
        summary: "Initial consultation notes entered. Pending complete lab results for AI confirmation.",
        recommendations: "Awaiting Lab results.",
        severity: "NORMAL",
        status: "NEEDS_REVISION",
        hasPdf: false,
        createdAt: "2024-02-20T11:30:00Z"
    },
    {
        id: "RPT-10046",
        encounterId: "ENC-5506",
        patientName: "Thomas Anderson",
        patientId: "PAT-8046",
        doctorName: "Dr. Amanda Chen",
        summary: "Advanced diabetic nephropathy confirmed. Correlates accurately with AI Prediction Model v1.8.5.",
        recommendations: "Adjust insulin dosage. Refer to transplant coordination team for preliminary workup.",
        severity: "SEVERE",
        status: "FINALIZED",
        hasPdf: true,
        pdfSize: "3.1 MB",
        createdAt: "2024-02-18T14:20:00Z"
    }
];

// --- Helpers ---
const severityStyles = {
    NORMAL: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MILD: "bg-blue-100 text-blue-700 border-blue-200",
    SEVERE: "bg-amber-100 text-amber-700 border-amber-200",
    CRITICAL: "bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-200"
};

const statusStyles = {
    FINALIZED: "text-emerald-600 bg-emerald-50 border-emerald-200",
    PENDING_REVIEW: "text-amber-600 bg-amber-50 border-amber-200",
    NEEDS_REVISION: "text-rose-600 bg-rose-50 border-rose-200"
};

const statusIcons = {
    FINALIZED: CheckCircle2,
    PENDING_REVIEW: Clock,
    NEEDS_REVISION: AlertCircle
};

export default function ReportsOverviewPage() {
    // --- State ---
    const [reports, setReports] = useState<MedicalReport[]>(mockReports);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState<DiagnosisSeverity | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Derived Data ---
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

    // Pagination Calculation
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, severityFilter, statusFilter]);

    // Aggregate Stats
    const totalReports = reports.length;
    const finalizedCount = reports.filter(r => r.status === "FINALIZED").length;
    const criticalCount = reports.filter(r => r.severity === "CRITICAL").length;
    const pdfCount = reports.filter(r => r.hasPdf).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Medical Reports</h1>
                    <p className="text-text-muted mt-1">Review finalized encounter summaries and clinical recommendations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Printer className="w-4 h-4" />
                        Print Log
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Archive
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Reports", value: totalReports, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Finalized/Signed", value: finalizedCount, icon: FileSignature, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Critical Findings", value: criticalCount, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "Generated PDFs", value: pdfCount, icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
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
                            placeholder="Search by Patient, Doctor or Report ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || severityFilter !== "ALL" || statusFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(severityFilter !== "ALL" || statusFilter !== "ALL") && (
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
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Severity</label>
                                    <select
                                        value={severityFilter}
                                        onChange={(e) => setSeverityFilter(e.target.value as DiagnosisSeverity | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Severities</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="MILD">Mild</option>
                                        <option value="SEVERE">Severe</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Document Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="FINALIZED">Finalized (Signed)</option>
                                        <option value="PENDING_REVIEW">Pending Review</option>
                                        <option value="NEEDS_REVISION">Needs Revision</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(severityFilter !== "ALL" || statusFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setSeverityFilter("ALL");
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

            {/* Reports Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-semibold w-64">Report & Patient Info</th>
                                <th className="px-6 py-4 font-semibold">Clinical Summary</th>
                                <th className="px-6 py-4 font-semibold w-40">Severity</th>
                                <th className="px-6 py-4 font-semibold w-40">Review Status</th>
                                <th className="px-6 py-4 font-semibold w-48">Date Issued</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No reports found</p>
                                            <p className="text-sm">Try adjusting your search or filters to locate documents.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedReports.map((rpt) => {
                                        const StatusIcon = statusIcons[rpt.status];

                                        return (
                                            <motion.tr
                                                key={rpt.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                            >
                                                {/* Patient & Report ID */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                                                            {rpt.patientName}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-primary font-medium">{rpt.patientId}</span>
                                                            <span className="text-xs text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border-light">{rpt.id}</span>
                                                        </div>
                                                        <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1.5">
                                                            <Stethoscope className="w-3.5 h-3.5" />
                                                            {rpt.doctorName}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Summary & Recommendations */}
                                                <td className="px-6 py-4 max-w-sm align-top">
                                                    <div className="space-y-2.5">
                                                        <div>
                                                            <p className="text-sm text-text-primary line-clamp-2" title={rpt.summary}>
                                                                <span className="font-semibold text-text-secondary mr-1">T/O:</span>
                                                                {rpt.summary}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-text-muted line-clamp-2 italic border-l-2 border-primary/30 pl-2" title={rpt.recommendations}>
                                                                <span className="font-semibold not-italic mr-1 text-primary">Rx:</span>
                                                                "{rpt.recommendations}"
                                                            </p>
                                                        </div>
                                                        {rpt.hasPdf && (
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                                                                <FileImage className="w-3.5 h-3.5" />
                                                                Medical_Report.pdf ({rpt.pdfSize})
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Severity */}
                                                <td className="px-6 py-4 align-top">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wider ${severityStyles[rpt.severity]}`}>
                                                        <Activity className="w-3 h-3" />
                                                        {rpt.severity}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1.5">
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 w-fit rounded-md text-[11px] font-bold border ${statusStyles[rpt.status]}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {rpt.status.replace("_", " ")}
                                                        </div>
                                                        {rpt.status === 'FINALIZED' && (
                                                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold pl-1">
                                                                <FileSignature className="w-3 h-3" />
                                                                Signed by Dr.
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                                                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                            {format(new Date(rpt.createdAt), "MMM d, yyyy")}
                                                        </div>
                                                        <div className="text-xs text-text-muted pl-5 font-mono">
                                                            {format(new Date(rpt.createdAt), "HH:mm")}
                                                        </div>
                                                        <div className="text-[10px] text-text-muted pl-5 pt-1">
                                                            Enc: {rpt.encounterId}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right align-top">
                                                    <div className="flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-primary hover:border-primary/30 transition-colors" title="View Full Report text">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {rpt.hasPdf && (
                                                            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors" title="Download PDF Report">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-blue-500 hover:border-blue-500/30 transition-colors mt-auto" title="Share externally">
                                                            <Share2 className="w-3.5 h-3.5" />
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
                                {Math.min(currentPage * itemsPerPage, filteredReports.length)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{filteredReports.length}</span> documents
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
