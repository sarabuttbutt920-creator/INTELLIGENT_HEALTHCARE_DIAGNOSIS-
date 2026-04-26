"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    X,
    Search,
    Download,
    Trash2,
    Activity,
    ShieldCheck,
    ScanLine,
    FileImage,
    Brain,
    Bone,
    FileArchive,
    Eye,
    Clock,
    Plus,
    Sparkles,
    HardDrive,
    Layers,
    ZoomIn,
    Info,
    AlertCircle
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type FileCategory = "MRI" | "XRAY" | "MEDICAL_REPORT";

interface MedicalFile {
    id: string;
    name: string;
    size: number;
    type: string;
    category: FileCategory;
    uploadDate: string;
    status: "UPLOADED" | "PROCESSING" | "ANALYZING";
    notes?: string;
    url?: string;
}

// Mock files removed, fetching from API

const categoryConfig: Record<FileCategory, {
    label: string; icon: React.ElementType; color: string; bg: string; border: string; gradient: string;
}> = {
    MRI: {
        label: "MRI Scans", icon: Brain,
        color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200",
        gradient: "from-violet-500 to-purple-600"
    },
    XRAY: {
        label: "X-Ray Images", icon: Bone,
        color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200",
        gradient: "from-sky-500 to-blue-600"
    },
    MEDICAL_REPORT: {
        label: "Medical Reports", icon: FileText,
        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
        gradient: "from-emerald-500 to-teal-600"
    }
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function MedicalImagingPage() {
    const [files, setFiles] = useState<MedicalFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<FileCategory | "ALL">("ALL");
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadCategory, setUploadCategory] = useState<FileCategory>("MRI");
    const [previewFile, setPreviewFile] = useState<MedicalFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "ALL" || f.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const mriCount = files.filter(f => f.category === "MRI").length;
    const xrayCount = files.filter(f => f.category === "XRAY").length;
    const reportCount = files.filter(f => f.category === "MEDICAL_REPORT").length;
    const totalStorage = files.reduce((acc, f) => acc + f.size, 0);

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/patient/files');
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = useCallback(async (uploadedFiles: FileList | File[]) => {
        if (!uploadedFiles || uploadedFiles.length === 0) return;
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        Array.from(uploadedFiles).forEach(f => formData.append('file', f));
        formData.append('category', uploadCategory);

        try {
            const res = await fetch('/api/patient/files', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setUploadProgress(100);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    fetchFiles();
                }, 500);
            } else {
                setIsUploading(false);
                alert('Upload failed');
            }
        } catch (e) {
            console.error(e);
            setIsUploading(false);
        }
    }, [uploadCategory, fetchFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this file?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/patient/files/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (previewFile?.id === id) setPreviewFile(null);
                setFiles(prev => prev.filter(f => f.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    }, [previewFile]);

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                            <ScanLine className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-text-primary">Medical Imaging</h1>
                    </div>
                    <p className="text-text-muted mt-1 ml-[52px]">
                        Upload MRI scans, X-ray images, and additional reports for comprehensive AI analysis.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Optional — Enhances AI analysis
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "MRI Scans", count: mriCount, icon: Brain, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-200" },
                    { label: "X-Ray Images", count: xrayCount, icon: Bone, gradient: "from-sky-500 to-blue-600", bg: "bg-sky-50", border: "border-sky-200" },
                    { label: "Medical Reports", count: reportCount, icon: FileText, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                    { label: "Total Storage", count: -1, icon: HardDrive, gradient: "from-slate-600 to-slate-800", bg: "bg-slate-50", border: "border-slate-200", extra: formatBytes(totalStorage) },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
                        className={`${stat.bg} ${stat.border} border rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-shadow`}
                    >
                        <div className={`absolute -right-4 -top-4 w-20 h-20 bg-linear-to-br ${stat.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <div className={`w-10 h-10 bg-linear-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-black text-text-primary">
                            {stat.count >= 0 ? stat.count : stat.extra}
                        </p>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upload Zone */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!isUploading ? (
                            <motion.div
                                key="upload-zone"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all border-2 border-dashed m-5 rounded-2xl ${isDragging
                                    ? "border-violet-400 bg-violet-50/50"
                                    : "border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300"
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <motion.div
                                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                    className="w-20 h-20 bg-linear-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-6 border border-violet-200"
                                >
                                    <UploadCloud className="w-10 h-10 text-violet-500" />
                                </motion.div>

                                <h3 className="text-2xl font-black text-text-primary mb-2">Upload Medical Imaging</h3>
                                <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
                                    Drag and drop your MRI scans, X-ray images, or medical reports. Supports DICOM, PNG, JPEG, and PDF formats.
                                </p>

                                <div className="flex flex-wrap gap-2 justify-center mb-6">
                                    {(Object.keys(categoryConfig) as FileCategory[]).map((cat) => {
                                        const cfg = categoryConfig[cat];
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setUploadCategory(cat)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${uploadCategory === cat
                                                    ? `${cfg.bg} ${cfg.border} ${cfg.color} shadow-sm`
                                                    : "bg-white border-border-light text-text-muted hover:bg-surface"
                                                    }`}
                                            >
                                                <cfg.icon className="w-4 h-4" />
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileInput}
                                    accept=".pdf,.png,.jpg,.jpeg,.dcm,.dicom,.doc,.docx"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3.5 bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Browse & Upload
                                </button>

                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-6 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted Storage
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload-progress"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-8 md:p-16 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-28 h-28 mb-8 relative flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full text-slate-100" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                                    </svg>
                                    <svg className="absolute inset-0 w-full h-full text-violet-500 -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                                            strokeDasharray="283"
                                            strokeDashoffset={283 - (283 * Math.min(uploadProgress, 100)) / 100}
                                            className="transition-all duration-300"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="text-xl font-black text-violet-600 relative z-10">{Math.min(uploadProgress, 100)}%</span>
                                </div>
                                <h3 className="text-2xl font-black text-text-primary mb-2">Encrypting & Uploading...</h3>
                                <p className="text-text-secondary text-sm">Securely uploading your {categoryConfig[uploadCategory].label.toLowerCase()} to the medical vault.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Guide Panel */}
                <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-violet-400" />
                            </div>
                            <h2 className="font-bold text-lg">Imaging Guide</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-bold">MRI Scans</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Upload kidney MRI in DICOM or PNG format. Coronal and axial views are most helpful for AI analysis.
                                </p>
                            </div>

                            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bone className="w-4 h-4 text-sky-400" />
                                    <span className="text-sm font-bold">X-Ray Images</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Abdominal X-rays help detect kidney stones, calcifications, and structural abnormalities.
                                </p>
                            </div>

                            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-bold">Extra Reports</span>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">OPTIONAL</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Upload previous consultation notes, specialist reports, or additional clinical documents.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            All files are encrypted at rest
                        </div>
                    </div>
                </div>
            </div>

            {/* File Library */}
            <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col">

                <div className="p-4 md:p-6 border-b border-border-light bg-slate-50/50 space-y-4 md:space-y-0 md:flex md:items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setFilterCategory("ALL")}
                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${filterCategory === "ALL"
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-text-secondary border-border-light hover:bg-surface"
                                }`}
                        >
                            All ({files.length})
                        </button>
                        {(Object.keys(categoryConfig) as FileCategory[]).map(cat => {
                            const cfg = categoryConfig[cat];
                            const count = files.filter(f => f.category === cat).length;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFilterCategory(cat)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${filterCategory === cat
                                        ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                                        : "bg-white text-text-secondary border-border-light hover:bg-surface"
                                        }`}
                                >
                                    <cfg.icon className="w-4 h-4" />
                                    {cfg.label}
                                    <span className="text-[10px] bg-white/80 px-1.5 py-0.5 rounded">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full md:w-72 shrink-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="p-4 md:p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted">
                            <FileImage className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-text-primary mb-2">No files found</h3>
                            <p className="max-w-md mx-auto text-sm">Upload your MRI scans, X-rays, or medical reports to see them here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredFiles.map((file, index) => {
                                    const cfg = categoryConfig[file.category];

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={file.id}
                                            className="group bg-white border border-border-light rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                                        >
                                            {/* File Preview Header */}
                                            <div className={`h-36 bg-linear-to-br ${cfg.gradient} relative flex items-center justify-center overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white/5" />
                                                <cfg.icon className="w-16 h-16 text-white/20 absolute -right-2 -bottom-2" />
                                                <cfg.icon className="w-12 h-12 text-white relative z-10" />

                                                <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                    {cfg.label}
                                                </span>

                                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setPreviewFile(file)}
                                                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/40 transition-colors"
                                                        title="Preview"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-white" />
                                                    </button>
                                                    <a href={file.url} download target="_blank" rel="noreferrer" className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/40 transition-colors" title="Download">
                                                        <Download className="w-3.5 h-3.5 text-white" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(file.id)}
                                                        className="p-1.5 bg-red-500/40 backdrop-blur-sm rounded-lg hover:bg-red-500/70 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* File Info */}
                                            <div className="p-4">
                                                <h4 className="font-bold text-sm text-text-primary truncate mb-1" title={file.name}>
                                                    {file.name}
                                                </h4>
                                                <p className="text-[11px] text-text-muted font-mono mb-3">{file.id}</p>

                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 text-text-muted">
                                                        <HardDrive className="w-3 h-3" />
                                                        <span className="font-semibold">{formatBytes(file.size)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-text-muted">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="font-semibold">{formatDate(file.uploadDate)}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-border-light/50 flex items-center justify-between">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {file.status}
                                                    </span>
                                                    <button
                                                        onClick={() => setPreviewFile(file)}
                                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <ZoomIn className="w-3 h-3" /> Details
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* File Preview Modal */}
            <AnimatePresence>
                {previewFile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            {(() => {
                                const cfg = categoryConfig[previewFile.category];
                                return (
                                    <>
                                        <div className={`h-40 bg-linear-to-br ${cfg.gradient} relative flex items-center justify-center overflow-hidden`}>
                                            <cfg.icon className="w-24 h-24 text-white/20 absolute -right-4 -bottom-4" />
                                            <div className="relative z-10 text-center text-white">
                                                <cfg.icon className="w-14 h-14 mx-auto mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{cfg.label}</span>
                                            </div>
                                            <button
                                                onClick={() => setPreviewFile(null)}
                                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-xl transition-colors text-white"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <h2 className="text-xl font-black text-text-primary mb-1 break-all">{previewFile.name}</h2>
                                            <p className="text-xs font-mono text-text-muted mb-5">ID: {previewFile.id}</p>

                                            <div className="grid grid-cols-2 gap-3 mb-5">
                                                <div className="bg-surface rounded-xl p-4 border border-border-light">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">File Size</p>
                                                    <p className="font-black text-text-primary">{formatBytes(previewFile.size)}</p>
                                                </div>
                                                <div className="bg-surface rounded-xl p-4 border border-border-light">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Uploaded</p>
                                                    <p className="font-black text-text-primary">{formatDate(previewFile.uploadDate)}</p>
                                                </div>
                                                <div className="bg-surface rounded-xl p-4 border border-border-light">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">File Type</p>
                                                    <p className="font-black text-text-primary text-sm truncate">{previewFile.type || "Unknown"}</p>
                                                </div>
                                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Status</p>
                                                    <p className="font-black text-emerald-700 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-4 h-4" /> {previewFile.status}
                                                    </p>
                                                </div>
                                            </div>

                                            {previewFile.notes && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <Info className="w-3.5 h-3.5" /> Clinical Notes
                                                    </p>
                                                    <p className="text-sm text-blue-900 leading-relaxed">{previewFile.notes}</p>
                                                </div>
                                            )}

                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                                                <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    DICOM and proprietary formats require specialized viewers. Download to open in your imaging software.
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setPreviewFile(null)}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-border-light font-bold text-text-secondary hover:bg-surface transition-colors"
                                                >
                                                    Close
                                                </button>
                                                <a href={previewFile.url} download target="_blank" rel="noreferrer" className="flex-1 px-4 py-3 rounded-xl gradient-primary text-white font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90">
                                                    <Download className="w-4 h-4" /> Download File
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
