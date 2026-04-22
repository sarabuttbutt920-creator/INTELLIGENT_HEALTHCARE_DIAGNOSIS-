"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
    HeartPulse,
    RefreshCw,
    X,
    TrendingUp,
    TrendingDown,
    Info
} from "lucide-react";
import { format } from "date-fns";

type PredictedLabel = "CKD" | "NOT_CKD" | "UNKNOWN";

interface PredictionRecord {
    id: string;
    encounterId: string;
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

const getRiskStyle = (score: number) => {
    if (score >= 0.7) return "text-rose-600 bg-rose-50 border-rose-200";
    if (score >= 0.4) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
};

function downloadCSV(predictions: PredictionRecord[]) {
    const rows = [
        ["ID", "Patient", "Patient ID", "Doctor", "Model", "Version", "Label", "Risk Score", "Created At"],
        ...predictions.map(p => [
            p.id, p.patientName, p.patientId, p.doctorName, p.modelName, p.modelVersion,
            p.predictedLabel, (p.riskScore * 100).toFixed(1) + "%", format(new Date(p.createdAt), "MMM d, yyyy HH:mm")
        ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `predictions_export_${Date.now()}.csv`;
    a.click();
}

export default function PredictionsOverviewPage() {
    const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [labelFilter, setLabelFilter] = useState<PredictedLabel | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPred, setSelectedPred] = useState<PredictionRecord | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchPredictions = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                label: labelFilter
            });
            const res = await fetch(`/api/admin/predictions?${params}`);
            const data = await res.json();
            if (data.success) {
                setPredictions(data.predictions);
                setTotal(data.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, labelFilter]);

    useEffect(() => {
        fetchPredictions();
    }, [fetchPredictions]);

    const filteredPredictions = useMemo(() => {
        if (!searchTerm) return predictions;
        const q = searchTerm.toLowerCase();
        return predictions.filter(p =>
            p.patientName.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.patientId.toLowerCase().includes(q) ||
            p.doctorName.toLowerCase().includes(q)
        );
    }, [predictions, searchTerm]);

    const totalPages = Math.ceil(total / itemsPerPage);
    const ckdCount = predictions.filter(p => p.predictedLabel === "CKD").length;
    const highRisk = predictions.filter(p => p.riskScore >= 0.8).length;
    const avgConf = predictions.length > 0
        ? predictions.reduce((a, p) => a + (p.riskScore > 0.5 ? p.riskScore : 1 - p.riskScore), 0) / predictions.length
        : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-text-primary">Predictions Overview</h1>
                    <p className="text-text-muted mt-1">Monitor AI diagnostic outputs and system accuracy in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchPredictions(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary shadow-sm font-medium text-sm transition-all ${refreshing ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Syncing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={() => downloadCSV(filteredPredictions)}
                        className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Inferences", value: total, icon: BrainCircuit, color: "text-primary", bg: "bg-primary/10" },
                    { label: "CKD Detected", value: ckdCount, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "High Risk (>80%)", value: highRisk, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Avg. Confidence", value: `${(avgConf * 100).toFixed(1)}%`, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-black text-text-primary mt-0.5">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by Patient, Doctor, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {["ALL", "CKD", "NOT_CKD", "UNKNOWN"].map(lbl => (
                            <button
                                key={lbl}
                                onClick={() => { setLabelFilter(lbl as any); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${labelFilter === lbl
                                    ? lbl === "ALL" ? "bg-slate-800 text-white border-slate-800"
                                        : lbl === "CKD" ? "bg-rose-100 text-rose-700 border-rose-200"
                                            : lbl === "NOT_CKD" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                : "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                    }`}
                            >
                                {lbl === "NOT_CKD" ? "NOT CKD" : lbl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface border-b border-border-light">
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Diagnosis</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Risk Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Model</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredPredictions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                                                <BrainCircuit className="w-14 h-14 mx-auto mb-3 opacity-20" />
                                                <p className="font-semibold text-text-secondary">No predictions found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters.</p>
                                            </td>
                                        </tr>
                                    ) : filteredPredictions.map((pred, idx) => {
                                        const LabelIcon = labelIcons[pred.predictedLabel];
                                        return (
                                            <motion.tr
                                                key={pred.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${labelStyles[pred.predictedLabel]}`}>
                                                            <LabelIcon className="w-3.5 h-3.5" />
                                                            {pred.predictedLabel.replace("_", " ")}
                                                        </span>
                                                        <p className="text-[10px] text-text-muted font-mono">{pred.id}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-sm text-text-primary">{pred.patientName}</p>
                                                    <p className="text-xs text-text-muted">{pred.patientId}</p>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                                        <Stethoscope className="w-3 h-3" /> {pred.doctorName}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${pred.riskScore >= 0.7 ? 'bg-rose-500' : pred.riskScore >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                    style={{ width: `${pred.riskScore * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-black px-2 py-0.5 rounded border ${getRiskStyle(pred.riskScore)}`}>
                                                                {(pred.riskScore * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-text-muted italic line-clamp-1">{pred.explanation}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                                                        <Server className="w-3.5 h-3.5 text-blue-500" />
                                                        {pred.modelName}
                                                    </div>
                                                    <p className="text-xs text-text-muted font-mono mt-0.5">v{pred.modelVersion}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                        {format(new Date(pred.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                    <p className="text-xs text-text-muted">{format(new Date(pred.createdAt), "h:mm a")}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setSelectedPred(pred)}
                                                            className="p-2 rounded-lg bg-surface border border-border-light text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
                                                            title="View Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
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
                            <span className="font-semibold text-text-primary">{totalPages}</span> •{" "}
                            <span className="font-semibold text-text-primary">{total}</span> total
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                                const pg = idx + 1;
                                return (
                                    <button key={pg} onClick={() => setCurrentPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === pg ? "gradient-primary text-white shadow-sm" : "border border-border-light bg-white text-text-secondary hover:bg-surface"}`}>
                                        {pg}
                                    </button>
                                );
                            })}
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPred && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className={`p-6 ${selectedPred.predictedLabel === "CKD" ? "bg-linear-to-br from-rose-500 to-rose-700" : selectedPred.predictedLabel === "NOT_CKD" ? "bg-linear-to-br from-emerald-500 to-emerald-700" : "bg-linear-to-br from-amber-500 to-amber-700"} text-white relative`}>
                                <button onClick={() => setSelectedPred(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    {selectedPred.predictedLabel === "CKD"
                                        ? <AlertTriangle className="w-8 h-8" />
                                        : selectedPred.predictedLabel === "NOT_CKD"
                                            ? <CheckCircle2 className="w-8 h-8" />
                                            : <Activity className="w-8 h-8" />}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">AI Prediction Result</p>
                                        <h2 className="text-2xl font-black">{selectedPred.predictedLabel.replace("_", " ")}</h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full" style={{ width: `${selectedPred.riskScore * 100}%` }} />
                                        </div>
                                        <span className="font-black text-xl">{(selectedPred.riskScore * 100).toFixed(1)}%</span>
                                    </div>
                                    <span className="text-xs opacity-70">Risk Score</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-surface rounded-xl p-4 border border-border-light">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Patient</p>
                                        <p className="font-black text-text-primary">{selectedPred.patientName}</p>
                                        <p className="text-xs text-text-muted font-mono">{selectedPred.patientId}</p>
                                    </div>
                                    <div className="bg-surface rounded-xl p-4 border border-border-light">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Reviewed By</p>
                                        <p className="font-black text-text-primary text-sm">{selectedPred.doctorName}</p>
                                    </div>
                                    <div className="bg-surface rounded-xl p-4 border border-border-light">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">AI Model</p>
                                        <p className="font-black text-text-primary text-sm">{selectedPred.modelName}</p>
                                        <p className="text-xs text-text-muted">v{selectedPred.modelVersion}</p>
                                    </div>
                                    <div className="bg-surface rounded-xl p-4 border border-border-light">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Generated</p>
                                        <p className="font-black text-text-primary text-sm">{format(new Date(selectedPred.createdAt), "MMM d, yyyy")}</p>
                                        <p className="text-xs text-text-muted">{format(new Date(selectedPred.createdAt), "h:mm a")}</p>
                                    </div>
                                </div>

                                {selectedPred.explanation && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Info className="w-3.5 h-3.5" /> AI Explanation
                                        </p>
                                        <p className="text-sm text-blue-900 leading-relaxed">{selectedPred.explanation}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button onClick={() => setSelectedPred(null)} className="flex-1 py-3 rounded-xl border border-border-light font-bold text-text-secondary hover:bg-surface transition-colors">
                                        Close
                                    </button>
                                    <button
                                        onClick={() => downloadCSV([selectedPred])}
                                        className="flex-1 py-3 rounded-xl gradient-primary text-white font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Export
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
