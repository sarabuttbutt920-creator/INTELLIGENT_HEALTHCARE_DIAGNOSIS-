"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, UserCircle, Calendar, CheckCircle2, Save,
    PenTool, AlignLeft, Bold, Italic, List, CheckSquare,
    Mic, Paperclip, History, AlertTriangle, Clock, Hash,
    ChevronDown, Activity, X, Loader2, Plus, RefreshCw,
    Tag, Stethoscope, HeartPulse
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface PatientOption {
    id: string;
    name: string;
    condition: string;
}

interface HistoryNote {
    id: string;
    date: string;
    type: string;
    snippet: string;
    tags: string[];
}

const templateOptions = [
    { id: "SOAP", name: "SOAP Note (Subjective, Objective, Assessment, Plan)" },
    { id: "GEN_CONSULT", name: "General Consultation" },
    { id: "LAB_REVIEW", name: "Lab & Biomarker Review" },
    { id: "AI_DIAG", name: "AI Diagnostic Follow-up" },
    { id: "PRESCRIPTION", name: "Medication / Prescription Update" }
];

const templateDefaults: Record<string, string> = {
    SOAP: "S (Subjective):\n\n\nO (Objective):\n\n\nA (Assessment):\n\n\nP (Plan):\n",
    GEN_CONSULT: "Chief Complaint:\n\n\nHistory of Present Illness:\n\n\nPhysical Examination:\n\n\nImpression:\n\n\nPlan:\n",
    LAB_REVIEW: "Biomarkers Reviewed:\n- Serum Creatinine:\n- Blood Urea Nitrogen:\n- Blood Pressure:\n- Hemoglobin:\n\nInterpretation:\n\n\nClinical Significance:\n\n\nRecommended Follow-up:\n",
    AI_DIAG: "KidneyNet AI Result Summary:\n\nConfidence Score:\n\nDoctor Assessment of AI Output:\n\n\nDisagreements / Overrides:\n\n\nPatient Counseling Notes:\n",
    PRESCRIPTION: "Medications Reviewed:\n\nNew Prescriptions:\n\nDiscontinued:\n\nDosage Changes:\n\nPatient Counseled On:\n",
};

export default function ClinicalNotesPage() {
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("SOAP");
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState(templateDefaults["SOAP"]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [historyNotes, setHistoryNotes] = useState<HistoryNote[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setError] = useState("");

    // Fetch real patients
    useEffect(() => {
        fetch("/api/doctor/patients")
            .then(r => r.json())
            .then(d => {
                if (d.success && d.patients) {
                    setPatients(d.patients.map((p: any) => ({
                        id: p.id.replace("PAT-", ""),
                        name: p.fullName,
                        condition: p.primaryCondition || "General"
                    })));
                }
            })
            .catch(() => {})
            .finally(() => setLoadingPatients(false));
    }, []);

    // Fetch history notes when patient changes
    useEffect(() => {
        if (!selectedPatient) { setHistoryNotes([]); return; }
        setLoadingHistory(true);
        fetch(`/api/doctor/notes?patientId=${selectedPatient}`)
            .then(r => r.json())
            .then(d => {
                if (d.success && d.notes) {
                    setHistoryNotes(d.notes.map((n: any) => {
                        const text = n.note_text || "";
                        const lines = text.split('\n');
                        const firstLine = lines[0] || "";
                        const type = firstLine.match(/\[([^\]]+)\]/)?.[1] || "GENERAL";
                        const snippet = lines.slice(1).join(' ').trim().substring(0, 100);
                        const tagMatch = text.match(/Tags:\s*(.+)/);
                        const tagList = tagMatch ? tagMatch[1].split(',').map((t: string) => t.trim()) : [];
                        return {
                            id: n.note_id?.toString() || Math.random().toString(),
                            date: n.created_at,
                            type,
                            snippet: snippet || "Clinical note recorded.",
                            tags: tagList
                        };
                    }));
                }
            })
            .catch(() => {})
            .finally(() => setLoadingHistory(false));
    }, [selectedPatient]);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
            if (!tags.includes(newTag)) setTags([...tags, newTag]);
            setTagInput("");
        }
    };

    const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tpl = e.target.value;
        setSelectedTemplate(tpl);
        if (templateDefaults[tpl] && !noteContent.trim()) {
            setNoteContent(templateDefaults[tpl]);
        }
    };

    const handleSaveDraft = async () => {
        if (!selectedPatient || !noteContent.trim()) {
            setError("Please select a patient and enter note content.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        setIsSaving(true);
        setError("");
        try {
            const res = await fetch("/api/doctor/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatient,
                    noteTitle,
                    noteContent,
                    template: selectedTemplate,
                    tags
                })
            });
            const data = await res.json();
            if (data.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                // Refresh history
                if (selectedPatient) {
                    fetch(`/api/doctor/notes?patientId=${selectedPatient}`)
                        .then(r => r.json())
                        .then(d => {
                            if (d.success) setHistoryNotes(d.notes.map((n: any) => {
                                const text = n.note_text || "";
                                const lines = text.split('\n');
                                const type = (lines[0] || "").match(/\[([^\]]+)\]/)?.[1] || "GENERAL";
                                const snippet = lines.slice(1).join(' ').trim().substring(0, 100);
                                return { id: n.note_id?.toString(), date: n.created_at, type, snippet: snippet || "Note saved.", tags: [] };
                            }));
                        });
                }
            } else {
                setError(data.message || "Failed to save note.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignNote = async () => {
        if (!selectedPatient || !noteContent.trim()) {
            setError("Please select a patient and enter note content.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        setIsSaving(true);
        setError("");
        try {
            const res = await fetch("/api/doctor/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatient,
                    noteTitle,
                    noteContent,
                    template: selectedTemplate,
                    tags
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsSigned(true);
            } else {
                setError(data.message || "Failed to sign note.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNewNote = () => {
        setIsSigned(false);
        setNoteTitle("");
        setNoteContent(templateDefaults[selectedTemplate] || "");
        setTags([]);
        setSaveSuccess(false);
    };

    const activePatient = patients.find(p => p.id === selectedPatient);

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical Documentation</h1>
                    <p className="text-text-muted mt-1">Draft notes, review patient history, and sign off on EHR records.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isSigned && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold tracking-wide text-sm shadow-sm"
                        >
                            <CheckCircle2 className="w-5 h-5" /> DOCUMENT SIGNED & LOCKED
                        </motion.div>
                    )}
                    {isSigned && (
                        <button
                            onClick={handleNewNote}
                            className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" /> New Note
                        </button>
                    )}
                </div>
            </div>

            {/* Toast Notifications */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl font-semibold text-sm"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Note saved to database successfully!
                    </motion.div>
                )}
                {saveError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-rose-600 text-white rounded-2xl shadow-xl font-semibold text-sm"
                    >
                        <AlertTriangle className="w-5 h-5" /> {saveError}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor Column */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Patient & Template Selectors */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-border-light shadow-sm p-5 flex flex-col sm:flex-row gap-4"
                    >
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <UserCircle className="w-4 h-4" /> Patient Record
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                    disabled={isSigned || loadingPatients}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-text-primary disabled:opacity-60"
                                >
                                    <option value="">{loadingPatients ? "Loading patients..." : "Select a patient..."}</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} · {p.condition}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-4 h-4" /> Clinical Template
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                    disabled={isSigned}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-text-primary disabled:opacity-60"
                                >
                                    {templateOptions.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Note Editor */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="bg-white rounded-2xl border border-border-light shadow-sm flex flex-col overflow-hidden relative"
                    >
                        {isSigned && (
                            <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <div className="px-6 py-3 bg-white/95 shadow-xl rounded-2xl border border-border-light font-bold text-text-muted tracking-widest uppercase flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Read-Only Record
                                </div>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="p-2 border-b border-border-light bg-slate-50 flex flex-wrap items-center gap-1">
                            {[Bold, Italic, List, CheckSquare, AlignLeft].map((Icon, i) => (
                                <button key={i} className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors">
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                            <div className="w-px h-5 bg-border-light mx-1" />
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 transition-colors ml-auto flex items-center gap-1.5 text-xs font-semibold">
                                <Mic className="w-4 h-4" /> Dictate
                            </button>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                <Paperclip className="w-4 h-4" /> Attach
                            </button>
                        </div>

                        {/* Title */}
                        <div className="px-6 py-4 border-b border-border-light">
                            <input
                                type="text"
                                placeholder="Note Title (e.g., Q3 Follow-up · CKD Stage 3a Review)"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                disabled={isSigned}
                                className="w-full text-xl font-bold text-text-primary placeholder:text-text-muted/40 outline-none bg-transparent disabled:opacity-60"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-96">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                disabled={isSigned}
                                placeholder="Type your clinical observations, assessment, and care plan here..."
                                className="w-full h-full min-h-96 p-6 resize-none outline-none text-text-primary leading-relaxed bg-transparent font-mono text-sm disabled:opacity-60"
                            />
                        </div>

                        {/* Tags */}
                        <div className="px-6 py-4 border-t border-border-light bg-surface/50 flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center gap-2 mt-1">
                                <Hash className="w-4 h-4 text-text-muted" />
                                <span className="text-sm font-semibold text-text-muted">Tags:</span>
                            </div>
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                                <AnimatePresence>
                                    {tags.map(t => (
                                        <motion.span
                                            key={t}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm"
                                        >
                                            {t}
                                            <button onClick={() => removeTag(t)} className="text-primary/60 hover:text-rose-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                                <input
                                    type="text"
                                    placeholder="Add tag + Enter..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    disabled={isSigned}
                                    className="text-sm bg-transparent outline-none w-36 text-text-primary placeholder:text-text-muted disabled:opacity-40"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                        {saveError && (
                            <p className="text-sm text-rose-500 font-semibold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> {saveError}
                            </p>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSigned || isSaving || !selectedPatient || !noteContent.trim()}
                                className="px-6 py-3 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Draft
                            </button>
                            <button
                                onClick={handleSignNote}
                                disabled={isSigned || !selectedPatient || !noteContent.trim() || isSaving}
                                className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                                {isSigned ? "Signed & Locked" : "Sign & Submit to EHR"}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Context + History */}
                <div className="space-y-5">

                    {/* Patient Snapshot */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl border border-border-light shadow-sm p-5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-border-light pb-3">
                            <Activity className="w-4 h-4 text-primary" /> Active Patient Context
                        </h3>

                        {activePatient ? (
                            <div className="space-y-4 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        {activePatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary">{activePatient.name}</p>
                                        <p className="text-xs font-mono text-text-muted">PAT-{activePatient.id}</p>
                                    </div>
                                </div>
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-rose-500 mb-1 flex items-center gap-1">
                                        <HeartPulse className="w-3 h-3" /> Primary Condition
                                    </p>
                                    <p className="text-sm font-semibold text-rose-700">{activePatient.condition}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 rounded-lg bg-surface border border-border-light text-center">
                                        <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Template</p>
                                        <p className="text-xs font-bold text-primary">{selectedTemplate}</p>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-surface border border-border-light text-center">
                                        <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Tags</p>
                                        <p className="text-xs font-bold text-text-primary">{tags.length} added</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Stethoscope className="w-10 h-10 text-text-muted opacity-20 mb-2" />
                                <p className="text-sm font-medium text-text-secondary">No patient selected</p>
                                <p className="text-xs text-text-muted mt-1">Select a patient to load their context.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Note History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-border-light shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                <History className="w-4 h-4 text-text-secondary" /> Previous Notes
                            </h3>
                            {loadingHistory && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                        </div>

                        {!activePatient ? (
                            <p className="text-sm text-center py-4 text-text-muted italic">Select a patient to view history...</p>
                        ) : loadingHistory ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : historyNotes.length === 0 ? (
                            <div className="text-center py-6">
                                <FileText className="w-8 h-8 text-text-muted opacity-20 mx-auto mb-2" />
                                <p className="text-sm text-text-muted">No previous notes found</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-light before:to-transparent">
                                {historyNotes.slice(0, 5).map((note) => (
                                    <div key={note.id} className="relative flex items-start gap-4 z-10">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="bg-surface rounded-xl border border-border-light p-3 flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{note.type.replace(/_/g, ' ')}</p>
                                                <p className="text-[10px] text-text-muted flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(note.date))} ago
                                                </p>
                                            </div>
                                            <p className="text-xs text-text-secondary leading-relaxed">"{note.snippet}"</p>
                                            {note.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mt-2">
                                                    {note.tags.filter(Boolean).map(t => (
                                                        <span key={t} className="text-[9px] font-bold text-text-muted bg-white border border-border-light px-1.5 py-0.5 rounded">{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
