"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    FileArchive,
    CheckCircle2,
    XCircle,
    X,
    Filter,
    Search,
    MoreVertical,
    Download,
    Eye,
    Trash2,
    TestTube,
    Activity,
    Stethoscope,
    HardDrive,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";

// --- Types ---
type FileCategory = "LAB_RESULT" | "IMAGING" | "CLINICAL_NOTE" | "PRESCRIPTION" | "OTHER";

interface MedicalFile {
    id: string;
    name: string;
    size: number; // bytes
    type: string;
    category: FileCategory;
    uploadDate: string; // ISO
    status: "UPLOADED" | "PROCESSING" | "FAILED";
}

// --- Mock Data ---
const mockFiles: MedicalFile[] = [
    {
        id: "FILE-1",
        name: "Blood_Work_Panel_March_2025.pdf",
        size: 2450000, // 2.45 MB
        type: "application/pdf",
        category: "LAB_RESULT",
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: "UPLOADED"
    },
    {
        id: "FILE-2",
        name: "Kidney_Ultrasound_Scan_0214.png",
        size: 8500000, // 8.5 MB
        type: "image/png",
        category: "IMAGING",
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        status: "UPLOADED"
    },
    {
        id: "FILE-3",
        name: "Dr_Jenkins_Consultation_Notes.docx",
        size: 45000, // 45 KB
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        category: "CLINICAL_NOTE",
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        status: "UPLOADED"
    },
    {
        id: "FILE-4",
        name: "Lisinopril_Prescription_Renew.pdf",
        size: 320000, // 320 KB
        type: "application/pdf",
        category: "PRESCRIPTION",
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        status: "UPLOADED"
    }
];

const categoryIcons: Record<FileCategory, React.ElementType> = {
    LAB_RESULT: TestTube,
    IMAGING: Activity,
    CLINICAL_NOTE: Stethoscope,
    PRESCRIPTION: FileText,
    OTHER: FileArchive
};

const categoryLabels: Record<FileCategory, string> = {
    LAB_RESULT: "Lab Results",
    IMAGING: "Scans & Imaging",
    CLINICAL_NOTE: "Clinical Notes",
    PRESCRIPTION: "Prescriptions",
    OTHER: "Other Documents"
};

// Helps format bytes to readable strings
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function PatientFilesPage() {
    // --- State ---
    const [files, setFiles] = useState<MedicalFile[]>(mockFiles);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<FileCategory | "ALL">("ALL");
    const [isDragging, setIsDragging] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Derived Data ---
    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "ALL" || f.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalStorageUsed = files.reduce((acc, file) => acc + file.size, 0);
    const storageLimit = 5 * 1024 * 1024 * 1024; // 5 GB
    const storagePercent = (totalStorageUsed / storageLimit) * 100;

    // --- Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFiles = (uploadedFiles: FileList | File[]) => {
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 15;
            });
        }, 200);

        // Simulate completion delay
        setTimeout(() => {
            clearInterval(interval);
            setIsUploading(false);
            setUploadProgress(0);

            // Add new files to state
            const newMedicalFiles: MedicalFile[] = Array.from(uploadedFiles).map((file, idx) => ({
                id: `FILE-NEW-${Date.now()}-${idx}`,
                name: file.name,
                size: file.size,
                type: file.type,
                // Assign a completely random category just for mock realism
                category: ["LAB_RESULT", "IMAGING", "CLINICAL_NOTE"][Math.floor(Math.random() * 3)] as FileCategory,
                uploadDate: new Date().toISOString(),
                status: "UPLOADED"
            }));

            setFiles(prev => [...newMedicalFiles, ...prev]);
        }, 1800);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    };

    const handleDelete = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Medical Vault</h1>
                    <p className="text-text-muted mt-1">Safely store and manage your clinical documents, lab results, and imaging scans.</p>
                </div>
            </div>

            {/* Top Grid: Uploader & Storage Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Drag & Drop Uploader */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {!isUploading ? (
                            <motion.div
                                key="upload-zone"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-8 md:p-12 relative flex flex-col items-center justify-center text-center transition-colors border-2 border-dashed m-6 rounded-2xl ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-border-light'}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-border-light mb-6 text-primary">
                                    <UploadCloud className={`w-10 h-10 transition-transform ${isDragging ? 'scale-110' : ''}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-text-primary mb-2">Upload Medical Documents</h3>
                                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                                    Drag and drop your PDF reports, DICOM images, or clinical notes here to encrypt and store them securely in your vault.
                                </p>

                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileInput}
                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.dcm"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3.5 gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                                >
                                    Browse Files
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
                                <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
                                    {/* Outer spinning ring */}
                                    <svg className="absolute inset-0 w-full h-full animate-spin text-slate-100" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset="0"></circle>
                                    </svg>
                                    {/* Progress ring */}
                                    <svg className="absolute inset-0 w-full h-full text-primary -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * uploadProgress) / 100} className="transition-all duration-300"></circle>
                                    </svg>
                                    <span className="text-xl font-black text-primary relative z-10">{Math.min(uploadProgress, 100)}%</span>
                                </div>
                                <h3 className="text-2xl font-bold text-text-primary mb-2">Encrypting & Uploading...</h3>
                                <p className="text-text-secondary">Securing your clinical data into MediIntel Vault.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Storage Overview Card */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-6 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <HardDrive className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="font-bold text-lg">Storage Quota</h2>
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-black">{formatBytes(totalStorageUsed)}</h3>
                                <p className="text-sm font-medium text-slate-400">Used of 5 GB Total</p>
                            </div>
                            <span className="text-lg font-bold text-indigo-400">{storagePercent.toFixed(1)}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
                            <motion.div
                                className="h-full bg-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${storagePercent}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                            />
                        </div>
                    </div>

                    <div className="mt-8 space-y-4 relative z-10">
                        <div className="flex justify-between items-center bg-slate-800/50 border border-slate-700 p-3 rounded-xl border-t-2 border-t-amber-500">
                            <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-bold">Imaging Scans</span>
                            </div>
                            <span className="text-sm font-medium text-slate-300">
                                {formatBytes(files.filter(f => f.category === 'IMAGING').reduce((a, b) => a + b.size, 0))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 border border-slate-700 p-3 rounded-xl border-t-2 border-t-blue-500">
                            <div className="flex items-center gap-3">
                                <TestTube className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-bold">Lab Results</span>
                            </div>
                            <span className="text-sm font-medium text-slate-300">
                                {formatBytes(files.filter(f => f.category === 'LAB_RESULT').reduce((a, b) => a + b.size, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Library Section */}
            <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col min-h-[500px]">

                {/* Filters & Search */}
                <div className="p-4 md:p-6 border-b border-border-light bg-slate-50/50 space-y-4 md:space-y-0 md:flex md:items-center justify-between z-10">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0 w-full md:w-auto">
                        <button
                            onClick={() => setFilterCategory("ALL")}
                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${filterCategory === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                        >
                            All Files
                        </button>
                        {(Object.keys(categoryLabels) as FileCategory[]).map(cat => {
                            const Icon = categoryIcons[cat];
                            const count = files.filter(f => f.category === cat).length;
                            if (count === 0 && cat !== filterCategory) return null; // Hide empty categories

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${filterCategory === cat ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {categoryLabels[cat]}
                                    <span className="ml-1 bg-white/50 px-1.5 py-0.5 rounded text-[10px] hidden sm:block">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full md:w-72 shrink-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search document name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* File List */}
                <div className="p-4 md:p-6 bg-white flex-1 overflow-x-auto">
                    {filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted">
                            <FileArchive className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-text-primary mb-2">No files found</h3>
                            <p className="max-w-md mx-auto text-sm">We couldn't find any documents matching your current filters. Try uploading a new file or adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="min-w-[800px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-light text-xs font-bold text-text-muted uppercase tracking-wider">
                                <div className="col-span-5">File Name</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Size</div>
                                <div className="col-span-2">Upload Date</div>
                                <div className="col-span-1 text-right">Actions</div>
                            </div>

                            {/* Table Body */}
                            <AnimatePresence>
                                {filteredFiles.map((file) => {
                                    const CategoryIcon = categoryIcons[file.category];
                                    const isPDF = file.type.includes('pdf');
                                    const isImage = file.type.includes('image');

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={file.id}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-border-light/50 hover:bg-surface transition-colors group"
                                        >
                                            {/* Name Column */}
                                            <div className="col-span-5 flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${isPDF ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                        isImage ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                            'bg-blue-50 text-blue-500 border-blue-100'
                                                    }`}>
                                                    {isPDF ? <FileText className="w-5 h-5" /> :
                                                        isImage ? <ImageIcon className="w-5 h-5" /> :
                                                            <FileArchive className="w-5 h-5" />}
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-bold text-sm text-text-primary truncate">{file.name}</p>
                                                    <p className="text-xs text-text-muted font-medium mt-0.5 truncate">{file.id}</p>
                                                </div>
                                            </div>

                                            {/* Category Column */}
                                            <div className="col-span-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-border-light rounded-lg text-xs font-bold text-text-secondary shadow-sm">
                                                    <CategoryIcon className="w-3.5 h-3.5 text-primary" />
                                                    {categoryLabels[file.category]}
                                                </span>
                                            </div>

                                            {/* Size Column */}
                                            <div className="col-span-2">
                                                <p className="text-sm font-semibold text-text-secondary">{formatBytes(file.size)}</p>
                                            </div>

                                            {/* Date Column */}
                                            <div className="col-span-2">
                                                <p className="text-sm font-semibold text-text-secondary">{format(parseISO(file.uploadDate), "MMM d, yyyy")}</p>
                                                <p className="text-[10px] text-text-muted uppercase tracking-wider">{format(parseISO(file.uploadDate), "h:mm a")}</p>
                                            </div>

                                            {/* Actions Column */}
                                            <div className="col-span-1 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-text-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="Download">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    className="p-2 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                    title="Delete File"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
