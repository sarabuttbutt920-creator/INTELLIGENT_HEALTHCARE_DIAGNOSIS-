"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Activity,
    BrainCircuit,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileText,
    Stethoscope,
    Server,
    HeartPulse
} from "lucide-react";
import { format } from "date-fns";

// --- Types ---
type PredictedLabel = "CKD" | "NOT_CKD" | "UNKNOWN";

interface PredictionRecord {
    id: string; // prediction_id
    patientName: string;
    patientId: string;
    doctorName: string;
    modelName: string;
    modelVersion: string;
    predictedLabel: PredictedLabel;
    riskScore: number;
    explanation: string;
    createdAt: string;
}

// --- Mock Data ---
const mockPredictions: PredictionRecord[] = [
    {
        id: "PRD-9012",
        patientName: "Michael Chen",
        patientId: "PAT-8041",
        doctorName: "Dr. Sarah Jenkins",
        modelName: "KidneyNet-XGB",
        modelVersion: "v2.1.0",
        predictedLabel: "CKD",
        riskScore: 0.89,
        explanation: "High serum creatinine (4.2) and elevated blood urea.",
        createdAt: "2024-02-25T10:30:00Z"
    },
    {
        id: "PRD-9013",
        patientName: "Emily Rodriguez",
        patientId: "PAT-8042",
        doctorName: "Dr. James Wilson",
        modelName: "KidneyNet-RF",
        modelVersion: "v1.8.5",
        predictedLabel: "NOT_CKD",
        riskScore: 0.12,
        explanation: "Normal parameters across basic metabolic panel.",
        createdAt: "2024-02-24T14:15:00Z"
    },
    {
        id: "PRD-9014",
        patientName: "Lisa Thompson",
        patientId: "PAT-8043",
        doctorName: "Dr. Sarah Jenkins",
        modelName: "KidneyNet-XGB",
        modelVersion: "v2.1.0",
        predictedLabel: "CKD",
        riskScore: 0.76,
        explanation: "Presence of albumin and hypertension noted.",
        createdAt: "2024-02-23T09:45:00Z"
    },
    {
        id: "PRD-9015",
        patientName: "Robert Taylor",
        patientId: "PAT-8044",
        doctorName: "Dr. Emily Rodriguez",
        modelName: "Ensemble-CKD",
        modelVersion: "v3.0.0",
        predictedLabel: "UNKNOWN",
        riskScore: 0.45,
        explanation: "Inconclusive. Missing critical RBC and Pus Cell data.",
        createdAt: "2024-02-22T16:20:00Z"
    },
    {
        id: "PRD-9016",
        patientName: "Alex Jordan",
        patientId: "PAT-8045",
        doctorName: "Dr. Hassan Ali",
        modelName: "KidneyNet-XGB",
        modelVersion: "v2.1.0",
        predictedLabel: "NOT_CKD",
        riskScore: 0.28,
        explanation: "Slightly elevated blood pressure but renal function normal.",
        createdAt: "2024-02-20T11:00:00Z"
    },
    {
        id: "PRD-9017",
        patientName: "Thomas Anderson",
        patientId: "PAT-8046",
        doctorName: "Dr. Amanda Chen",
        modelName: "KidneyNet-RF",
        modelVersion: "v1.8.5",
        predictedLabel: "CKD",
        riskScore: 0.94,
        explanation: "Severe diabetes mellitus correlation with advanced age and high urea.",
        createdAt: "2024-02-18T13:10:00Z"
    }
];

// --- Helpers ---
const labelStyles = {
    CKD: "bg-rose-100 text-rose-700 border-rose-200",
    NOT_CKD: "bg-emerald-100 text-emerald-700 border-emerald-200",
    UNKNOWN: "bg-amber-100 text-amber-700 border-amber-200"
};

const labelIcons = {
    CKD: AlertTriangle,
    NOT_CKD: CheckCircle2,
    UNKNOWN: Activity
};

const getRiskColor = (score: number) => {
    if (score >= 0.7) return "text-rose-600 bg-rose-50 border-rose-200";
    if (score >= 0.4) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
};

export default function PredictionsOverviewPage() {
    // --- State ---
    const [predictions, setPredictions] = useState<PredictionRecord[]>(mockPredictions);
    const [searchTerm, setSearchTerm] = useState("");
    const [labelFilter, setLabelFilter] = useState<PredictedLabel | "ALL">("ALL");
    const [modelFilter, setModelFilter] = useState<string>("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Derived distinct Models
    const uniqueModels = useMemo(() => {
        const models = new Set(predictions.map(p => p.modelName));
        return Array.from(models).sort();
    }, [predictions]);

    // --- Derived Data ---
    const filteredPredictions = useMemo(() => {
        return predictions.filter(pred => {
            const matchesSearch =
                pred.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pred.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pred.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pred.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLabel = labelFilter === "ALL" || pred.predictedLabel === labelFilter;
            const matchesModel = modelFilter === "ALL" || pred.modelName === modelFilter;

            return matchesSearch && matchesLabel && matchesModel;
        });
    }, [predictions, searchTerm, labelFilter, modelFilter]);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
    const paginatedPredictions = filteredPredictions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, labelFilter, modelFilter]);

    // Aggregate Stats
    const totalPredictions = predictions.length;
    const countCKD = predictions.filter(p => p.predictedLabel === "CKD").length;
    const highRiskMatches = predictions.filter(p => p.riskScore >= 0.8).length;
    const avgConfidence = predictions.reduce((acc, p) => acc + (p.riskScore > 0.5 ? p.riskScore : (1 - p.riskScore)), 0) / (totalPredictions || 1);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Predictions Overview</h1>
                    <p className="text-text-muted mt-1">Monitor AI diagnostic outputs and system accuracy in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Server className="w-4 h-4" />
                        Model Logs
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Findings
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Inferences", value: totalPredictions, icon: BrainCircuit, color: "text-primary", bg: "bg-primary/10" },
                    { label: "CKD Detected", value: countCKD, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "High Risk (>80%)", value: highRiskMatches, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Avg. Model Confidence", value: `${(avgConfidence * 100).toFixed(1)}%`, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
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
                            placeholder="Search by Patient, Doctor or Prediction ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || labelFilter !== "ALL" || modelFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(labelFilter !== "ALL" || modelFilter !== "ALL") && (
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
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Result</label>
                                    <select
                                        value={labelFilter}
                                        onChange={(e) => setLabelFilter(e.target.value as PredictedLabel | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Results</option>
                                        <option value="CKD">CKD Positive</option>
                                        <option value="NOT_CKD">Negative (NOT CKD)</option>
                                        <option value="UNKNOWN">Inconclusive</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Model Used</label>
                                    <select
                                        value={modelFilter}
                                        onChange={(e) => setModelFilter(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Models</option>
                                        {uniqueModels.map(mdl => (
                                            <option key={mdl} value={mdl}>{mdl}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(labelFilter !== "ALL" || modelFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setLabelFilter("ALL");
                                                setModelFilter("ALL");
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

            {/* Predictions Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-semibold">Diagnosis Output</th>
                                <th className="px-6 py-4 font-semibold">Patient Information</th>
                                <th className="px-6 py-4 font-semibold">Risk & Explanation</th>
                                <th className="px-6 py-4 font-semibold">Engine Details</th>
                                <th className="px-6 py-4 font-semibold">Generated On</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedPredictions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No predictions found</p>
                                            <p className="text-sm">Try adjusting your search or filters to see model outputs.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPredictions.map((pred) => {
                                        const LabelIcon = labelIcons[pred.predictedLabel];
                                        const riskStyle = getRiskColor(pred.riskScore);

                                        return (
                                            <motion.tr
                                                key={pred.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                            >
                                                {/* Output Label */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border tracking-wide shadow-sm ${labelStyles[pred.predictedLabel]}`}>
                                                            <LabelIcon className="w-4 h-4" />
                                                            {pred.predictedLabel.replace('_', ' ')}
                                                        </span>
                                                        <p className="text-xs text-text-muted font-mono flex items-center gap-1 ml-1">
                                                            ID: {pred.id}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Patient Info */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                                                            {pred.patientName}
                                                        </p>
                                                        <p className="text-xs text-text-muted font-mono">{pred.patientId}</p>
                                                        <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1">
                                                            <Stethoscope className="w-3.5 h-3.5" />
                                                            {pred.doctorName}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Risk & Explanation */}
                                                <td className="px-6 py-4 max-w-[250px]">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-text-muted font-semibold tracking-wide uppercase">Score:</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${riskStyle}`}>
                                                                {(pred.riskScore * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-text-secondary truncate pr-4 italic" title={pred.explanation}>
                                                            "{pred.explanation}"
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Model Info */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                                                            <Server className="w-3.5 h-3.5 text-blue-500" />
                                                            {pred.modelName}
                                                        </div>
                                                        <div className="text-xs text-text-muted font-mono pl-5">
                                                            Version: {pred.modelVersion}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                        {format(new Date(pred.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-text-muted pl-5 pt-0.5">
                                                        {format(new Date(pred.createdAt), "HH:mm a")}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-primary hover:border-primary/30 transition-colors" title="View Full AI Explanation">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors" title="View PDF Report">
                                                            <FileText className="w-4 h-4" />
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
                                {Math.min(currentPage * itemsPerPage, filteredPredictions.length)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{filteredPredictions.length}</span> predictions
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
