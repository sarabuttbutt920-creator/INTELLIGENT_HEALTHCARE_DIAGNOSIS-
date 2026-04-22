"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, Activity, BrainCircuit, Stethoscope,
    FileText, CheckCircle2, Clock, UserCircle, HeartPulse,
    AlertTriangle, ChevronLeft, ChevronRight, PlayCircle,
    Download, Eye, PenTool, X, Phone, Mail, Droplets,
    Calendar, TrendingUp, ShieldCheck, RefreshCw, Loader2
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

type EncounterStatus = "DRAFT" | "PENDING_REVIEW" | "SIGNED_OFF";
type AIResult = "CKD_DETECTED" | "NOT_CKD" | "INCONCLUSIVE";

interface ClinicalEncounter {
    id: string;
    patientName: string;
    patientId: string;
    date: string;
    modelUsed: string;
    aiConfidence: number;
    aiResult: AIResult;
    status: EncounterStatus;
    keyBiomarkers: {
        bloodPressure: string;
        hemoglobin: string;
        serumCreatinine: string;
        bloodUrea: string;
    };
    doctorNotes?: string;
}

const resultStyles: Record<AIResult, string> = {
    CKD_DETECTED: "bg-rose-100 text-rose-700 border-rose-200",
    NOT_CKD: "bg-emerald-100 text-emerald-700 border-emerald-200",
    INCONCLUSIVE: "bg-amber-100 text-amber-700 border-amber-200"
};

const resultIcons: Record<AIResult, any> = {
    CKD_DETECTED: AlertTriangle,
    NOT_CKD: CheckCircle2,
    INCONCLUSIVE: Activity
};

const statusStyles: Record<EncounterStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING_REVIEW: "bg-indigo-100 text-indigo-700 border-indigo-200",
    SIGNED_OFF: "bg-blue-100 text-blue-700 border-blue-200"
};

const statusLabels: Record<EncounterStatus, string> = {
    DRAFT: "Draft / Incomplete",
    PENDING_REVIEW: "Awaiting Signature",
    SIGNED_OFF: "Clinician Signed"
};

// Full View Modal
function EncounterModal({
    enc,
    onClose,
    onSignOff,
    doctorName
}: {
    enc: ClinicalEncounter;
    onClose: () => void;
    onSignOff: (id: string) => Promise<void>;
    doctorName: string;
}) {
    const [signing, setSigning] = useState(false);
    const [signed, setSigned] = useState(enc.status === "SIGNED_OFF");
    const [doctorNoteInput, setDoctorNoteInput] = useState(enc.doctorNotes || "");

    const RIcon = resultIcons[enc.aiResult];
    const isPending = enc.status === "PENDING_REVIEW";

    const handleSignOff = async () => {
        setSigning(true);
        try {
            await onSignOff(enc.id);
            setSigned(true);
        } finally {
            setSigning(false);
        }
    };

    const biomarkerRanges: Record<string, { normal: string; flag: boolean }> = {
        "Blood Pressure": {
            normal: "< 120/80 mmHg",
            flag: parseInt(enc.keyBiomarkers.bloodPressure) > 130
        },
        "Serum Creatinine": {
            normal: "0.7–1.3 mg/dL",
            flag: parseFloat(enc.keyBiomarkers.serumCreatinine) > 1.3
        },
        "Blood Urea": {
            normal: "7–20 mg/dL",
            flag: parseFloat(enc.keyBiomarkers.bloodUrea) > 40
        },
        "Hemoglobin": {
            normal: "12–17 g/dL",
            flag: parseFloat(enc.keyBiomarkers.hemoglobin) < 12
        },
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 30 }}
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    className="relative w-full max-w-4xl bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-border-light mb-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Gradient Header */}
                    <div className={`p-6 relative overflow-hidden ${enc.aiResult === 'CKD_DETECTED' ? 'bg-linear-to-r from-rose-600 to-red-700' : enc.aiResult === 'NOT_CKD' ? 'bg-linear-to-r from-emerald-600 to-teal-700' : 'bg-linear-to-r from-amber-500 to-orange-600'}`}>
                        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.1)_20px,rgba(255,255,255,0.1)_40px)]" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black text-white border border-white/30">
                                {enc.patientName.charAt(0)}
                            </div>
                            <div className="text-white flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-black">{enc.patientName}</h2>
                                    {signed && (
                                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                                            <ShieldCheck className="w-3.5 h-3.5" /> SIGNED OFF
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/70 font-mono text-sm mt-0.5">{enc.patientId} · {enc.id}</p>
                                <p className="text-white/80 text-xs mt-1 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {format(parseISO(enc.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                                    <span className="opacity-60">({formatDistanceToNow(parseISO(enc.date))} ago)</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* AI Diagnostic Banner */}
                        <div className={`p-5 rounded-2xl border flex items-start gap-4 ${resultStyles[enc.aiResult]}`}>
                            <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                                <RIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">AI Diagnostic Result</p>
                                        <h3 className="text-xl font-black tracking-tight">{enc.aiResult.replace('_', ' ')}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Confidence Score</p>
                                        <p className="text-2xl font-black">{enc.aiConfidence}%</p>
                                    </div>
                                </div>
                                <div className="mt-3 h-2 bg-white/40 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${enc.aiConfidence}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-current rounded-full opacity-70"
                                    />
                                </div>
                                <p className="text-xs mt-2 opacity-70 font-mono">Engine: {enc.modelUsed}</p>
                            </div>
                        </div>

                        {/* Biomarkers Grid */}
                        <div>
                            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                                <HeartPulse className="w-4 h-4 text-primary" />
                                Key Biomarkers & Lab Results
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "Blood Pressure", value: enc.keyBiomarkers.bloodPressure, unit: "mmHg", normalRange: "< 130/80", isFlag: parseInt(enc.keyBiomarkers.bloodPressure) > 130 },
                                    { label: "Serum Creatinine", value: enc.keyBiomarkers.serumCreatinine, unit: "mg/dL", normalRange: "0.7–1.3", isFlag: parseFloat(enc.keyBiomarkers.serumCreatinine) > 1.3 },
                                    { label: "Blood Urea", value: enc.keyBiomarkers.bloodUrea, unit: "mg/dL", normalRange: "7–40", isFlag: parseFloat(enc.keyBiomarkers.bloodUrea) > 40 },
                                    { label: "Hemoglobin", value: enc.keyBiomarkers.hemoglobin, unit: "g/dL", normalRange: "12–17", isFlag: parseFloat(enc.keyBiomarkers.hemoglobin) < 12 },
                                ].map(b => (
                                    <div key={b.label} className={`p-4 rounded-2xl border ${b.isFlag ? 'bg-rose-50 border-rose-200' : 'bg-surface border-border-light'} text-center relative`}>
                                        {b.isFlag && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                                                <AlertTriangle className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-2">{b.label}</p>
                                        <p className={`text-lg font-black ${b.isFlag ? 'text-rose-600' : 'text-text-primary'}`}>{b.value}</p>
                                        <p className="text-[9px] text-text-muted mt-1">{b.unit}</p>
                                        <p className="text-[9px] text-text-muted mt-1 opacity-60">Normal: {b.normalRange}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Doctor Notes Input */}
                        <div>
                            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                                <PenTool className="w-4 h-4 text-primary" />
                                Clinical Observations & Notes
                            </h4>
                            <textarea
                                value={doctorNoteInput}
                                onChange={(e) => setDoctorNoteInput(e.target.value)}
                                disabled={signed}
                                placeholder="Enter your clinical observations, assessment, and care plan for this encounter..."
                                className="w-full min-h-30 p-4 rounded-2xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-sm text-text-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            {signed && (
                                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    This encounter has been signed off by {doctorName}
                                </p>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-light">
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusStyles[signed ? 'SIGNED_OFF' : enc.status]}`}>
                                    {statusLabels[signed ? 'SIGNED_OFF' : enc.status]}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => downloadPDFReport(enc, doctorNoteInput, doctorName)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                                {!signed && isPending && (
                                    <button
                                        onClick={handleSignOff}
                                        disabled={signing}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-60"
                                    >
                                        {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                                        {signing ? "Signing..." : "Verify & Sign Off"}
                                    </button>
                                )}
                                {signed && (
                                    <span className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold">
                                        <ShieldCheck className="w-4 h-4" /> Signed Off
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// PDF Report Generator
function downloadPDFReport(enc: ClinicalEncounter, notes: string, doctorName: string) {
    // Dynamic import for jsPDF to avoid SSR issues
    import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        // Color helpers
        const setColor = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
        const setFill = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);
        const setDraw = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);

        // Header gradient bar
        setFill(108, 60, 225);
        doc.roundedRect(0, 0, pageWidth, 38, 0, 0, 'F');

        // Logo area
        setColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('IHDS · MediIntel', margin, 16);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Intelligent Healthcare Diagnostic System', margin, 23);
        doc.text('Confidential Medical Report · Powered by KidneyNet AI', margin, 29);

        // Report title right side
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICAL ENCOUNTER REPORT', pageWidth - margin, 16, { align: 'right' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(enc.id, pageWidth - margin, 23, { align: 'right' });
        doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, pageWidth - margin, 29, { align: 'right' });

        let y = 50;

        // AI Result Banner
        const bannerColor = enc.aiResult === 'CKD_DETECTED' ? [220, 38, 38] :
                           enc.aiResult === 'NOT_CKD' ? [5, 150, 105] : [217, 119, 6];
        setFill(bannerColor[0], bannerColor[1], bannerColor[2]);
        doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');
        setColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(`AI Diagnosis: ${enc.aiResult.replace('_', ' ')}`, margin + 6, y + 9);
        doc.setFontSize(10);
        doc.text(`Confidence: ${enc.aiConfidence}%  ·  Engine: ${enc.modelUsed}`, margin + 6, y + 17);
        y += 32;

        // Patient Info Section
        setColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Patient Information', margin, y);
        y += 2;
        setDraw(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 8;

        setColor(71, 85, 105);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const patientInfoRows = [
            ['Patient Name', enc.patientName, 'Patient ID', enc.patientId],
            ['Encounter Date', format(parseISO(enc.date), 'MMMM d, yyyy'), 'Time', format(parseISO(enc.date), 'h:mm a')],
            ['Attending Physician', `Dr. ${doctorName}`, 'Status', statusLabels[enc.status]],
        ];

        patientInfoRows.forEach(row => {
            setColor(100, 116, 139);
            doc.setFont('helvetica', 'bold');
            doc.text(row[0] + ':', margin, y);
            setColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');
            doc.text(row[1], margin + 40, y);
            setColor(100, 116, 139);
            doc.setFont('helvetica', 'bold');
            doc.text(row[2] + ':', pageWidth / 2, y);
            setColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');
            doc.text(row[3], pageWidth / 2 + 35, y);
            y += 7;
        });

        y += 6;

        // Biomarkers Section
        setColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Laboratory Results & Biomarkers', margin, y);
        y += 2;
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 10;

        const bioRows = [
            { label: 'Blood Pressure', value: enc.keyBiomarkers.bloodPressure, unit: 'mmHg', normal: '< 130/80', flag: parseInt(enc.keyBiomarkers.bloodPressure) > 130 },
            { label: 'Serum Creatinine', value: enc.keyBiomarkers.serumCreatinine, unit: 'mg/dL', normal: '0.7–1.3', flag: parseFloat(enc.keyBiomarkers.serumCreatinine) > 1.3 },
            { label: 'Blood Urea Nitrogen', value: enc.keyBiomarkers.bloodUrea, unit: 'mg/dL', normal: '7–40', flag: parseFloat(enc.keyBiomarkers.bloodUrea) > 40 },
            { label: 'Hemoglobin', value: enc.keyBiomarkers.hemoglobin, unit: 'g/dL', normal: '12–17', flag: parseFloat(enc.keyBiomarkers.hemoglobin) < 12 },
        ];

        // Table header
        setFill(248, 247, 255);
        doc.roundedRect(margin, y - 4, contentWidth, 8, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        setColor(108, 60, 225);
        doc.text('Biomarker', margin + 3, y + 1);
        doc.text('Result', margin + 60, y + 1);
        doc.text('Unit', margin + 90, y + 1);
        doc.text('Normal Range', margin + 115, y + 1);
        doc.text('Status', margin + 155, y + 1);
        y += 8;

        bioRows.forEach((b, i) => {
            if (i % 2 === 0) {
                setFill(250, 250, 255);
                doc.rect(margin, y - 4, contentWidth, 8, 'F');
            }
            setColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.text(b.label, margin + 3, y + 1);
            if (b.flag) { setColor(220, 38, 38); doc.setFont('helvetica', 'bold'); }
            doc.text(b.value, margin + 60, y + 1);
            setColor(71, 85, 105);
            doc.setFont('helvetica', 'normal');
            doc.text(b.unit, margin + 90, y + 1);
            doc.text(b.normal, margin + 115, y + 1);
            if (b.flag) {
                setFill(254, 226, 226);
                doc.roundedRect(margin + 150, y - 3, 28, 6, 1, 1, 'F');
                setColor(220, 38, 38);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.text('ABNORMAL', margin + 152, y + 1);
            } else {
                setFill(209, 250, 229);
                doc.roundedRect(margin + 150, y - 3, 24, 6, 1, 1, 'F');
                setColor(5, 150, 105);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.text('NORMAL', margin + 153, y + 1);
            }
            setColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            y += 8;
        });

        y += 6;

        // Clinical Notes Section
        if (notes && notes.trim()) {
            setColor(30, 41, 59);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Physician Clinical Notes', margin, y);
            y += 2;
            doc.line(margin, y + 2, pageWidth - margin, y + 2);
            y += 10;

            setFill(248, 247, 255);
            const notesLines = doc.splitTextToSize(notes, contentWidth - 10);
            const notesHeight = notesLines.length * 5 + 10;
            doc.roundedRect(margin, y - 4, contentWidth, notesHeight, 3, 3, 'F');
            setColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(notesLines, margin + 5, y + 2);
            y += notesHeight + 8;
        }

        // Signature Block
        if (enc.status === 'SIGNED_OFF' || notes) {
            setFill(240, 253, 244);
            doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
            setColor(5, 150, 105);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Digitally Signed by: Dr. ${doctorName}`, margin + 5, y + 9);
            setColor(71, 85, 105);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')} · System: IHDS MediIntel Platform`, margin + 5, y + 17);
            y += 30;
        }

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            setFill(248, 247, 255);
            doc.rect(0, doc.internal.pageSize.getHeight() - 14, pageWidth, 14, 'F');
            setColor(100, 116, 139);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text('This report is confidential and intended for authorized medical personnel only. IHDS MediIntel Platform.', pageWidth / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });
        }

        doc.save(`MediIntel_${enc.patientId}_${enc.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    });
}

export default function DoctorEncountersPage() {
    const [encounters, setEncounters] = useState<ClinicalEncounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [resultFilter, setResultFilter] = useState<AIResult | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<EncounterStatus | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedEncounter, setSelectedEncounter] = useState<ClinicalEncounter | null>(null);
    const [doctorName, setDoctorName] = useState("Doctor");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchEncounters = async () => {
        setLoading(true);
        try {
            const [encRes, profileRes] = await Promise.all([
                fetch("/api/doctor/encounters"),
                fetch("/api/doctor/profile")
            ]);
            const encData = await encRes.json();
            const profileData = await profileRes.json();
            if (encData.success && encData.encounters) setEncounters(encData.encounters);
            if (profileData.success) setDoctorName(profileData.data.user.full_name);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEncounters(); }, []);

    const handleSignOff = async (encounterId: string) => {
        await fetch(`/api/doctor/encounters/${encounterId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SIGN_OFF' })
        });
        setEncounters(prev => prev.map(e => e.id === encounterId ? { ...e, status: 'SIGNED_OFF' } : e));
    };

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

    const sortedEncounters = useMemo(() => {
        return [...filteredEncounters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredEncounters]);

    const totalPages = Math.ceil(sortedEncounters.length / itemsPerPage);
    const paginatedEncounters = sortedEncounters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filterKey = `${searchTerm}-${resultFilter}-${statusFilter}`;
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
    if (filterKey !== prevFilterKey) { setPrevFilterKey(filterKey); setCurrentPage(1); }

    const totalEncounters = encounters.length;
    const pendingReviews = encounters.filter(e => e.status === "PENDING_REVIEW").length;
    const ckdDetectedRate = totalEncounters > 0 ? Math.round((encounters.filter(e => e.aiResult === "CKD_DETECTED").length / totalEncounters) * 100) : 0;
    const draftCount = encounters.filter(e => e.status === "DRAFT").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-muted text-sm font-medium">Loading clinical encounters...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Full View Modal */}
            {selectedEncounter && (
                <EncounterModal
                    enc={selectedEncounter}
                    onClose={() => setSelectedEncounter(null)}
                    onSignOff={handleSignOff}
                    doctorName={doctorName}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical AI Encounters</h1>
                    <p className="text-text-muted mt-1">Review model predictions, verify biomarkers, and sign off on diagnostic reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setLoading(true); fetchEncounters(); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <PlayCircle className="w-4 h-4" />
                        New Inference
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Encounters", value: totalEncounters, icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Pending Signatures", value: pendingReviews, icon: PenTool, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Draft Inferencing", value: draftCount, icon: Clock, color: "text-slate-500", bg: "bg-slate-100" },
                    { label: "CKD Positive Rate", value: `${ckdDetectedRate}%`, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50" },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between card-hover relative overflow-hidden"
                    >
                        <div>
                            <p className="text-sm font-medium text-text-muted mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        {stat.label === "Pending Signatures" && pendingReviews > 0 && (
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500 animate-pulse" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by patient name, ID, or encounter ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || resultFilter !== "ALL" || statusFilter !== "ALL" ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-border-light text-text-secondary hover:bg-surface"}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {(resultFilter !== "ALL" || statusFilter !== "ALL") && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
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
                                        <option value="INCONCLUSIVE">Inconclusive</option>
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
                                        <option value="PENDING_REVIEW">Needs Approval</option>
                                        <option value="SIGNED_OFF">Signed Off</option>
                                        <option value="DRAFT">Draft</option>
                                    </select>
                                </div>
                                {(resultFilter !== "ALL" || statusFilter !== "ALL") && (
                                    <button
                                        onClick={() => { setResultFilter("ALL"); setStatusFilter("ALL"); }}
                                        className="text-sm text-red-500 font-medium hover:underline text-left"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Encounters List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {paginatedEncounters.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
                            <BrainCircuit className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-20" />
                            <p className="font-bold text-xl text-text-primary">No encounters match filters</p>
                            <p className="text-text-secondary mt-1">Adjust filters or initiate a new diagnostic run.</p>
                        </div>
                    ) : (
                        paginatedEncounters.map((enc, i) => {
                            const RIcon = resultIcons[enc.aiResult];
                            const isPending = enc.status === "PENDING_REVIEW";

                            return (
                                <motion.div
                                    key={enc.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md ${isPending ? 'border-indigo-300 shadow-indigo-500/5' : 'border-border-light'}`}
                                >
                                    {/* Left: Patient & Status */}
                                    <div className={`p-5 md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-border-light ${isPending ? 'bg-indigo-50/30' : 'bg-slate-50/50'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold border tracking-widest uppercase shadow-sm ${statusStyles[enc.status]}`}>
                                                {statusLabels[enc.status]}
                                            </span>
                                            <span className="text-xs font-mono text-text-muted bg-white border border-border-light px-1.5 py-0.5 rounded shadow-sm">
                                                {enc.id}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-auto">
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
                                        </div>
                                    </div>

                                    {/* Middle: AI Inference */}
                                    <div className="p-5 md:w-1/3 flex flex-col justify-center bg-white">
                                        <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted mb-3 flex items-center gap-1.5">
                                            <BrainCircuit className="w-3.5 h-3.5 text-primary" /> Model Output
                                        </p>

                                        <div className={`p-4 rounded-xl border flex items-center gap-3 relative overflow-hidden ${resultStyles[enc.aiResult]}`}>
                                            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shrink-0">
                                                <RIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{enc.aiResult.replace("_", " ")}</h3>
                                                <p className="text-xs font-medium opacity-80 mt-0.5">Confidence: <strong>{enc.aiConfidence}%</strong></p>
                                            </div>
                                        </div>

                                        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${enc.aiConfidence}%` }}
                                                transition={{ duration: 1, delay: i * 0.05 }}
                                                className={`h-full rounded-full ${enc.aiResult === 'CKD_DETECTED' ? 'bg-rose-500' : enc.aiResult === 'NOT_CKD' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                            />
                                        </div>

                                        <p className="text-[10px] text-text-muted mt-2 font-mono bg-surface border border-border-light px-2 py-1 rounded w-fit">
                                            {enc.modelUsed}
                                        </p>
                                    </div>

                                    {/* Right: Biomarkers & Actions */}
                                    <div className="p-5 md:w-1/3 flex flex-col border-t md:border-t-0 md:border-l border-border-light bg-white">
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {[
                                                { label: "Blood Press.", value: enc.keyBiomarkers.bloodPressure },
                                                { label: "Serum Creat.", value: `${enc.keyBiomarkers.serumCreatinine} mg/dL` },
                                                { label: "Blood Urea", value: `${enc.keyBiomarkers.bloodUrea} mg/dL` },
                                                { label: "Hemoglobin", value: `${enc.keyBiomarkers.hemoglobin} g/dL` },
                                            ].map(b => (
                                                <div key={b.label} className="bg-surface p-2 rounded-lg border border-border-light">
                                                    <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-0.5">{b.label}</p>
                                                    <p className="text-sm font-semibold text-text-primary font-mono">{b.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setSelectedEncounter(enc)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 border border-border-light hover:border-primary/20 transition-colors text-xs font-semibold shadow-sm"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Full View
                                            </button>
                                            {isPending ? (
                                                <button
                                                    onClick={() => setSelectedEncounter(enc)}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-semibold shadow-md shadow-indigo-500/20"
                                                >
                                                    <PenTool className="w-3.5 h-3.5" /> Verify & Sign
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => downloadPDFReport(enc, enc.doctorNotes || '', doctorName)}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors text-xs font-semibold shadow-sm"
                                                >
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
