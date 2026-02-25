"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Syringe,
    Pill,
    Stethoscope,
    HeartPulse,
    AlertTriangle,
    FileText,
    Calendar,
    ChevronDown,
    Search,
    Filter,
    Download,
    UserCircle,
    Info,
    Shield,
    Clock,
    Printer,
    CheckCircle2
} from "lucide-react";
import { format, parseISO } from "date-fns";

// --- Types ---
type HistoryEventType = "DIAGNOSIS" | "SURGERY" | "IMMUNIZATION" | "LAB_TEST" | "CONSULTATION";

interface HistoryEvent {
    id: string;
    date: string; // ISO
    type: HistoryEventType;
    title: string;
    provider: string;
    description: string;
    status?: "ACTIVE" | "RESOLVED" | "COMPLETED";
    tags?: string[];
}

interface HealthSummary {
    conditions: { name: string; dateDiagnosed: string; status: "Active" | "Managed" | "Resolved"; icon: any; color: string }[];
    allergies: { substance: string; reaction: string; severity: "Mild" | "Moderate" | "Severe" }[];
    immunizations: { name: string; date: string; status: "Up to date" | "Due Soon" }[];
    familyHistory: { relation: string; condition: string }[];
}

// --- Mock Data ---
const mockHistoryEvents: HistoryEvent[] = [
    {
        id: "EVT-1",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        type: "LAB_TEST",
        title: "Comprehensive Metabolic Panel (CMP)",
        provider: "LabCorp Diagnostics",
        description: "Routine blood work analyzing kidney function. Elevated serum creatinine levels detected compared to previous baseline.",
        status: "COMPLETED",
        tags: ["KidneyNet", "eGFR", "Creatinine"]
    },
    {
        id: "EVT-2",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        type: "DIAGNOSIS",
        title: "Chronic Kidney Disease (Stage 3a)",
        provider: "Dr. Sarah Jenkins",
        description: "Initial diagnosis based on consecutive eGFR readings between 45-59 mL/min and presence of microalbuminuria.",
        status: "ACTIVE",
        tags: ["Nephrology", "Chronic"]
    },
    {
        id: "EVT-3",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
        type: "CONSULTATION",
        title: "Hypertension Management Review",
        provider: "Dr. Marcus Vance",
        description: "Adjusted Lisinopril dosage to 10mg daily to better manage systemic blood pressure and protect renal function.",
        status: "COMPLETED"
    },
    {
        id: "EVT-4",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2).toISOString(),
        type: "IMMUNIZATION",
        title: "Influenza Vaccine (Quadrivalent)",
        provider: "MediIntel Primary Care",
        description: "Annual flu vaccination administered. No adverse reactions reported.",
        status: "COMPLETED"
    },
    {
        id: "EVT-5",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5).toISOString(),
        type: "SURGERY",
        title: "Appendectomy (Laparoscopic)",
        provider: "General Hospital Surgery Dept.",
        description: "Emergency removal of inflamed appendix. Uncomplicated recovery.",
        status: "RESOLVED"
    }
];

const mockSummary: HealthSummary = {
    conditions: [
        { name: "Chronic Kidney Disease (Stage 3a)", dateDiagnosed: "2026-01-10", status: "Active", icon: Activity, color: "rose" },
        { name: "Essential Hypertension", dateDiagnosed: "2024-05-15", status: "Managed", icon: HeartPulse, color: "amber" },
        { name: "Type 2 Diabetes Mellitus", dateDiagnosed: "2023-11-02", status: "Managed", icon: Activity, color: "blue" }
    ],
    allergies: [
        { substance: "Penicillin", reaction: "Hives, Anaphylaxis Risk", severity: "Severe" },
        { substance: "Pollen", reaction: "Allergic Rhinitis", severity: "Mild" }
    ],
    immunizations: [
        { name: "COVID-19 Bivalent Booster", date: "2025-10-15", status: "Up to date" },
        { name: "Influenza (Seasonal)", date: "2025-09-01", status: "Up to date" },
        { name: "Pneumococcal Conjugate", date: "2020-04-10", status: "Due Soon" }
    ],
    familyHistory: [
        { relation: "Father", condition: "Coronary Artery Disease" },
        { relation: "Mother", condition: "Type 2 Diabetes" }
    ]
};

// --- Helpers ---
const eventTypeStyles: Record<HistoryEventType, { icon: any, color: string, label: string }> = {
    DIAGNOSIS: { icon: AlertTriangle, color: "rose", label: "Diagnosis" },
    SURGERY: { icon: Activity, color: "indigo", label: "Surgery/Procedure" },
    IMMUNIZATION: { icon: Syringe, color: "emerald", label: "Immunization" },
    LAB_TEST: { icon: FileText, color: "blue", label: "Laboratory Test" },
    CONSULTATION: { icon: Stethoscope, color: "amber", label: "Clinical Consult" }
};

export default function PatientHistoryPage() {
    // --- State ---
    const [activeTab, setActiveTab] = useState<"TIMELINE" | "SUMMARY">("SUMMARY");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<HistoryEventType | "ALL">("ALL");

    // --- Derived Data ---
    const filteredEvents = mockHistoryEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.provider.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "ALL" || event.type === selectedType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Clinical History</h1>
                    <p className="text-text-muted mt-1">Review your comprehensive medical background, chronic conditions, and past procedures.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary transition-colors shadow-sm font-medium text-sm">
                        <Printer className="w-4 h-4" />
                        Print Summary
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 gradient-primary text-white rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all font-bold text-sm">
                        <Download className="w-4 h-4" />
                        Export Full CCDA Record
                    </button>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-border-light p-2 shadow-sm flex flex-col sm:flex-row gap-2 justify-between items-center sm:sticky top-4 z-20">
                <div className="flex w-full sm:w-auto bg-surface p-1 rounded-xl border border-border-light">
                    <button
                        onClick={() => setActiveTab("SUMMARY")}
                        className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'SUMMARY' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Health Summary
                    </button>
                    <button
                        onClick={() => setActiveTab("TIMELINE")}
                        className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'TIMELINE' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Chronological Timeline
                    </button>
                </div>

                {/* Secure Badge */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-100">
                    <Shield className="w-4 h-4" /> Provider Verified Record
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "SUMMARY" ? (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        {/* 1. Conditions & Issues */}
                        <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border-light bg-slate-50/50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">Ongoing Conditions & Problems</h2>
                                    <p className="text-sm text-text-muted">Clinically diagnosed chronic or active issues requiring management.</p>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockSummary.conditions.map((cond, idx) => (
                                    <div key={idx} className="bg-surface rounded-2xl p-5 border border-border-light flex flex-col items-start gap-4 hover:border-primary/30 transition-colors">
                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${cond.status === 'Active' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {cond.status}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-text-primary mb-1">{cond.name}</h3>
                                            <p className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> Diagnosed: {format(parseISO(cond.dateDiagnosed), "MMM yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Allergies & Tolerances */}
                        <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border-light bg-slate-50/50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">Allergology</h2>
                                    <p className="text-sm text-text-muted">Documented adverse reactions to medications or environmental factors.</p>
                                </div>
                            </div>
                            <div className="p-0">
                                <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-border-light text-xs font-bold text-text-muted uppercase tracking-wider bg-surface">
                                    <div className="col-span-1">Substance</div>
                                    <div className="col-span-1">Adverse Reaction</div>
                                    <div className="col-span-1 border-l pl-4 border-border-light">Severity</div>
                                </div>
                                {mockSummary.allergies.map((allergy, idx) => (
                                    <div key={idx} className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-border-light/50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <div className="col-span-1 font-bold text-text-primary">{allergy.substance}</div>
                                        <div className="col-span-1 text-sm font-medium text-text-secondary">{allergy.reaction}</div>
                                        <div className="col-span-1 border-l pl-4 border-border-light">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${allergy.severity === 'Severe' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {allergy.severity === 'Severe' ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />} {allergy.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Split: Immunizations & Family History */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Immunizations */}
                            <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col">
                                <div className="p-5 border-b border-border-light bg-slate-50/50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100 flex items-center justify-center shrink-0">
                                        <Syringe className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-text-primary">Vaccines & Immunizations</h2>
                                </div>
                                <div className="flex-1 p-5 space-y-4">
                                    {mockSummary.immunizations.map((vax, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-surface rounded-2xl border border-border-light">
                                            <div>
                                                <h4 className="font-bold text-sm text-text-primary">{vax.name}</h4>
                                                <p className="text-xs text-text-muted font-medium mt-1">Administered: {format(parseISO(vax.date), "MMM d, yyyy")}</p>
                                            </div>
                                            <div className={`text-xs font-bold flex items-center gap-1.5 ${vax.status === 'Up to date' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {vax.status === 'Up to date' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {vax.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Family History */}
                            <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col">
                                <div className="p-5 border-b border-border-light bg-slate-50/50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
                                        <UserCircle className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-text-primary">Family Medical History</h2>
                                </div>
                                <div className="flex-1 p-5 space-y-4">
                                    {mockSummary.familyHistory.map((fam, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 bg-surface rounded-2xl border border-border-light">
                                            <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest w-24 text-center shrink-0">
                                                {fam.relation}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-text-primary">{fam.condition}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                ) : (
                    <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden"
                    >
                        {/* Filters & Search for Timeline */}
                        <div className="p-4 md:p-6 border-b border-border-light bg-slate-50/50 space-y-4 md:space-y-0 md:flex md:items-center justify-between z-10 sticky top-0">
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0 w-full md:w-auto">
                                <button
                                    onClick={() => setSelectedType("ALL")}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedType === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                                >
                                    All Events
                                </button>
                                {(Object.keys(eventTypeStyles) as HistoryEventType[]).map(type => {
                                    const style = eventTypeStyles[type];
                                    const Icon = style.icon;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${selectedType === type ? `bg-${style.color}-50 text-${style.color}-700 border-${style.color}-200` : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {style.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="relative w-full md:w-72 shrink-0">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search timeline..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Interactive Timeline Log */}
                        <div className="p-6 md:p-10">
                            {filteredEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
                                    <Clock className="w-16 h-16 mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-text-primary mb-2">No clinical events found</h3>
                                    <p className="max-w-md mx-auto text-sm">No historical data matches your current search or filter criteria.</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-slate-100 ml-4 md:ml-8 space-y-10 pb-10">
                                    <AnimatePresence>
                                        {filteredEvents.map((event, idx) => {
                                            const style = eventTypeStyles[event.type];
                                            const Icon = style.icon;

                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="relative pl-8 md:pl-12 group"
                                                >
                                                    {/* Timeline Node Ring */}
                                                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white bg-${style.color}-100 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-125`}>
                                                        <Icon className={`w-3.5 h-3.5 text-${style.color}-600`} />
                                                    </div>

                                                    <div className="bg-surface rounded-2xl border border-border-light p-5 md:p-6 shadow-sm group-hover:border-primary/30 transition-colors">

                                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-border-light/50">
                                                            <div>
                                                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(parseISO(event.date), "MMMM d, yyyy")}</p>
                                                                <h3 className="text-xl font-bold text-text-primary">{event.title}</h3>
                                                            </div>
                                                            <div className="shrink-0 flex items-center md:items-end flex-col gap-2">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-${style.color}-50 border border-${style.color}-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-${style.color}-700`}>
                                                                    {style.label}
                                                                </span>
                                                                {event.status && (
                                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${event.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                                        {event.status === 'ACTIVE' ? 'Current/Active' : 'Resolved/Done'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <p className="text-[15px] font-medium text-text-secondary leading-relaxed mb-4">
                                                            {event.description}
                                                        </p>

                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <p className="text-sm font-semibold text-text-muted flex items-center gap-1.5">
                                                                <Stethoscope className="w-4 h-4" /> {event.provider}
                                                            </p>

                                                            {event.tags && event.tags.length > 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    {event.tags.map(tag => (
                                                                        <span key={tag} className="px-2 py-1 bg-white border border-border-light rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
