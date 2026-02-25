"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Search,
    UserCircle,
    Calendar,
    CheckCircle2,
    Save,
    PenTool,
    AlignLeft,
    Bold,
    Italic,
    List,
    CheckSquare,
    Mic,
    Paperclip,
    History,
    AlertTriangle,
    Clock,
    Hash,
    ChevronDown,
    Activity,
    X
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// --- Mock Data ---
const patientOptions = [
    { id: "PAT-8041", name: "Michael Chen", condition: "CKD Stage 3a" },
    { id: "PAT-8042", name: "Emily Rodriguez", condition: "Hypertension" },
    { id: "PAT-8043", name: "Lisa Thompson", condition: "Type 2 Diabetes" },
    { id: "PAT-8044", name: "Robert Taylor", condition: "CKD Stage 4" },
    { id: "PAT-8045", name: "Alex Jordan", condition: "Routine Checkup" },
    { id: "PAT-8046", name: "Samantha Hughes", condition: "Elevated Creatinine" }
];

const templateOptions = [
    { id: "SOAP", name: "SOAP Note (Subjective, Objective, Assessment, Plan)" },
    { id: "GEN_CONSULT", name: "General Consultation" },
    { id: "LAB_REVIEW", name: "Lab & Biomarker Review" },
    { id: "AI_DIAG", name: "AI Diagnostic Follow-up" },
    { id: "PRESCRIPTION", name: "Medication / Prescription Update" }
];

const recentHistoryNotes = [
    {
        id: "NOTE-201",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Dr. Sarah Jenkins",
        type: "LAB_REVIEW",
        snippet: "Patient's eGFR has dropped to 42. Discussed dietary restrictions and scheduled Kidneynet inference.",
        tags: ["#eGFR", "#Dietary"]
    },
    {
        id: "NOTE-200",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Dr. Sarah Jenkins",
        type: "GEN_CONSULT",
        snippet: "Initial visit regarding mild flank pain and hypertension. Ordered comprehensive metabolic panel.",
        tags: ["#Initial", "#Hypertension"]
    }
];

export default function ClinicalNotesPage() {
    // --- State ---
    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("SOAP");
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    // UI states
    const [isSaving, setIsSaving] = useState(false);
    const [isSigned, setIsSigned] = useState(false);

    // --- Handlers ---
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSaveDraft = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };

    const handleSignNote = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsSigned(true);
        }, 1200);
    };

    const activePatient = patientOptions.find(p => p.id === selectedPatient);

    // Auto-fill template placeholder
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tpl = e.target.value;
        setSelectedTemplate(tpl);

        if (tpl === "SOAP" && !noteContent) {
            setNoteContent("S (Subjective):\n\nO (Objective):\n\nA (Assessment):\n\nP (Plan):\n");
        } else if (tpl === "LAB_REVIEW" && !noteContent) {
            setNoteContent("Biomarkers Reviewed:\n- Serum Creatinine:\n- Blood Urea:\n- Blood Pressure:\n\nAnalysis & Follow-up:\n");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical Documentation</h1>
                    <p className="text-text-muted mt-1">Draft notes, review patient history, and sign off on EHR records.</p>
                </div>
                {isSigned && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold tracking-wide text-sm shadow-sm">
                        <CheckCircle2 className="w-5 h-5" /> DOCUMENT SIGNED & LOCKED
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Area: The Editor (Takes 2 Columns) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top Controls: Patient & Template */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border-light shadow-sm p-5 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <UserCircle className="w-4 h-4" /> Link to Patient Record
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                    disabled={isSigned}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-text-primary disabled:opacity-60"
                                >
                                    <option value="" disabled>Select a patient...</option>
                                    {patientOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.condition}</option>
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

                    {/* The Main Editor Container */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-border-light shadow-sm flex flex-col overflow-hidden relative">
                        {isSigned && (
                            <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 cursor-not-allowed flex items-center justify-center">
                                <span className="px-6 py-3 bg-white/90 shadow-xl rounded-2xl border border-border-light font-bold text-text-muted tracking-widest uppercase flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Read-Only Record
                                </span>
                            </div>
                        )}

                        {/* Formatting Toolbar */}
                        <div className="p-2 border-b border-border-light bg-slate-50 flex flex-wrap items-center gap-1">
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors"><Bold className="w-4 h-4" /></button>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors"><Italic className="w-4 h-4" /></button>
                            <div className="w-px h-5 bg-border-light mx-1" />
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors"><List className="w-4 h-4" /></button>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors"><CheckSquare className="w-4 h-4" /></button>
                            <div className="w-px h-5 bg-border-light mx-1" />
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors"><AlignLeft className="w-4 h-4" /></button>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors ml-auto flex items-center gap-1.5 text-xs font-semibold">
                                <Mic className="w-4 h-4" /> Dictate
                            </button>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-slate-200 hover:text-text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                <Paperclip className="w-4 h-4" /> Attach Lab
                            </button>
                        </div>

                        {/* Note Title */}
                        <div className="px-6 py-4 border-b border-border-light">
                            <input
                                type="text"
                                placeholder="Note Title (e.g., Q3 Follow-up Review)"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                className="w-full text-xl font-bold text-text-primary placeholder:text-text-muted/50 outline-none bg-transparent"
                            />
                        </div>

                        {/* Rich Text Area */}
                        <div className="flex-1 min-h-[400px]">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Type your clinical observations, assessment, and care plan here..."
                                className="w-full h-full min-h-[400px] p-6 resize-none outline-none text-text-primary leading-relaxed bg-transparent"
                            ></textarea>
                        </div>

                        {/* Tags Input Area */}
                        <div className="px-6 py-4 border-t border-border-light bg-surface flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center gap-2 mt-1">
                                <Hash className="w-4 h-4 text-text-muted" />
                                <span className="text-sm font-semibold text-text-muted mr-2">Tags:</span>
                            </div>
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                                <AnimatePresence>
                                    {tags.map(t => (
                                        <motion.span
                                            key={t}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="px-2.5 py-1 bg-white border border-border-light rounded-md text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm"
                                        >
                                            {t}
                                            <button onClick={() => removeTag(t)} className="text-text-muted hover:text-rose-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                                <input
                                    type="text"
                                    placeholder="Add tag and press Enter..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="text-sm bg-transparent outline-none w-48 text-text-primary placeholder:text-text-muted"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Footer */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-end gap-3">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSigned || isSaving}
                            className="px-6 py-3 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Draft"}
                        </button>
                        <button
                            onClick={handleSignNote}
                            disabled={isSigned || !selectedPatient || !noteContent || isSaving}
                            className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <PenTool className="w-4 h-4" /> {isSigned ? "Signed & Locked" : "Sign & Submit to EHR"}
                        </button>
                    </motion.div>
                </div>

                {/* Right Area: Context & History panel */}
                <div className="space-y-6">

                    {/* Active Patient Snapshot */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-border-light shadow-sm p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />

                        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-border-light pb-3">
                            <Activity className="w-4 h-4 text-primary" /> Active Patient Context
                        </h3>

                        {activePatient ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-lg">
                                        {activePatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary">{activePatient.name}</p>
                                        <p className="text-xs font-mono text-text-muted">{activePatient.id}</p>
                                    </div>
                                </div>
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-rose-500 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Primary Condition</p>
                                    <p className="text-sm font-semibold text-rose-700">{activePatient.condition}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <UserCircle className="w-10 h-10 text-text-muted opacity-20 mb-2" />
                                <p className="text-sm font-medium text-text-secondary">No patient selected</p>
                                <p className="text-xs text-text-muted mt-1">Select a patient to load their chart context.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Previous Patient Notes History */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-border-light shadow-sm p-5">
                        <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                <History className="w-4 h-4 text-text-secondary" /> Recent Encounters
                            </h3>
                            {activePatient && (
                                <span className="text-xs font-bold bg-surface px-2 py-0.5 rounded text-text-muted">History loaded</span>
                            )}
                        </div>

                        {!activePatient ? (
                            <p className="text-sm text-center py-4 text-text-muted">Waiting for patient context...</p>
                        ) : (
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-light before:to-transparent">

                                {recentHistoryNotes.map((note, idx) => (
                                    <div key={note.id} className="relative flex items-start gap-4 z-10">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="bg-surface rounded-xl border border-border-light p-3 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{note.type.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(note.date))} ago</p>
                                            </div>
                                            <p className="text-xs text-text-secondary leading-relaxed mb-2">"{note.snippet}"</p>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {note.tags.map(t => (
                                                    <span key={t} className="text-[9px] font-bold text-text-muted bg-white border border-border-light px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-border-light text-primary text-xs font-bold hover:bg-primary/5 transition-colors">
                                    Load Complete History
                                </button>
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
