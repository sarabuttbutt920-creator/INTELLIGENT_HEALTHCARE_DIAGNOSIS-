"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    BrainCircuit,
    Droplets,
    HeartPulse,
    ClipboardList,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    TestTube,
    Scale,
    FileText,
    Zap,
    Beaker,
    User,
    Ruler,
    Weight,
    Gauge,
    Sparkles,
    ShieldCheck,
    TrendingUp,
    Cigarette,
    Heart,
    UploadCloud,
    Brain,
    Bone,
    X,
    FileImage,
    Plus,
    Trash2
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type UploadCategory = "MRI" | "XRAY" | "REPORT";

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    category: UploadCategory;
    type: string;
}

interface PredictionFormData {
    // Demographics
    age: string;
    gender: string;
    weight: string;
    height: string;
    bmi: string;
    // Vital Signs
    systolic_bp: string;
    diastolic_bp: string;
    // Core Kidney Function Tests
    serum_creatinine: string;
    blood_urea_nitrogen: string;
    egfr: string;
    uric_acid: string;
    // Electrolytes
    sodium: string;
    potassium: string;
    chloride: string;
    bicarbonate: string;
    // Urine Analysis
    urine_albumin: string;
    urine_creatinine: string;
    albumin_creatinine_ratio: string;
    urine_protein: string;
    urine_rbc: string;
    urine_wbc: string;
    specific_gravity: string;
    // Blood Profile
    hemoglobin: string;
    hematocrit: string;
    wbc_count: string;
    platelet_count: string;
    random_blood_sugar: string;
    hba1c: string;
    // Medical History (binary)
    diabetes: string;
    hypertension: string;
    cardiovascular_disease: string;
    family_history_kidney_disease: string;
    smoking: string;
}

const initialFormData: PredictionFormData = {
    age: "", gender: "", weight: "", height: "", bmi: "",
    systolic_bp: "", diastolic_bp: "",
    serum_creatinine: "", blood_urea_nitrogen: "", egfr: "", uric_acid: "",
    sodium: "", potassium: "", chloride: "", bicarbonate: "",
    urine_albumin: "", urine_creatinine: "", albumin_creatinine_ratio: "",
    urine_protein: "", urine_rbc: "", urine_wbc: "", specific_gravity: "",
    hemoglobin: "", hematocrit: "", wbc_count: "", platelet_count: "",
    random_blood_sugar: "", hba1c: "",
    diabetes: "", hypertension: "", cardiovascular_disease: "",
    family_history_kidney_disease: "", smoking: ""
};

const TOTAL_STEPS = 8;

const stepsConfig = [
    { num: 1, label: "Demographics", icon: User, color: "text-indigo-500", bgActive: "bg-indigo-500", bgLight: "bg-indigo-50", borderColor: "border-indigo-200" },
    { num: 2, label: "Vital Signs", icon: HeartPulse, color: "text-rose-500", bgActive: "bg-rose-500", bgLight: "bg-rose-50", borderColor: "border-rose-200" },
    { num: 3, label: "Kidney Function", icon: Beaker, color: "text-amber-500", bgActive: "bg-amber-500", bgLight: "bg-amber-50", borderColor: "border-amber-200" },
    { num: 4, label: "Electrolytes", icon: Zap, color: "text-emerald-500", bgActive: "bg-emerald-500", bgLight: "bg-emerald-50", borderColor: "border-emerald-200" },
    { num: 5, label: "Urine Analysis", icon: Droplets, color: "text-blue-500", bgActive: "bg-blue-500", bgLight: "bg-blue-50", borderColor: "border-blue-200" },
    { num: 6, label: "Blood Profile", icon: TestTube, color: "text-purple-500", bgActive: "bg-purple-500", bgLight: "bg-purple-50", borderColor: "border-purple-200" },
    { num: 7, label: "Medical History", icon: ClipboardList, color: "text-orange-500", bgActive: "bg-orange-500", bgLight: "bg-orange-50", borderColor: "border-orange-200" },
    { num: 8, label: "Upload Reports", icon: UploadCloud, color: "text-violet-500", bgActive: "bg-violet-500", bgLight: "bg-violet-50", borderColor: "border-violet-200" },
];

const uploadCategoryConfig: Record<UploadCategory, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
    MRI: { label: "MRI Scan", icon: Brain, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
    XRAY: { label: "X-Ray Image", icon: Bone, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
    REPORT: { label: "Medical Report", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// ─── Reusable Input Components ──────────────────────────────────────────────────
function NumberInput({
    label, unit, placeholder, value, onChange, step, info
}: {
    label: string; unit?: string; placeholder: string; value: string;
    onChange: (v: string) => void; step?: string; info?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 group"
        >
            <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
                {label}
                {info && (
                    <span className="text-[10px] font-semibold text-text-muted bg-surface px-1.5 py-0.5 rounded-md border border-border-light">
                        {info}
                    </span>
                )}
            </label>
            <div className="relative">
                <input
                    type="number"
                    step={step || "any"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-3.5 pr-16 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all text-sm font-medium"
                />
                {unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted bg-white px-2 py-1 rounded-lg border border-border-light/50">
                        {unit}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

function ToggleSwitch({
    label, value, onChange, icon: Icon
}: {
    label: string; value: string; onChange: (v: string) => void; icon?: React.ElementType;
}) {
    const isYes = value === "1";
    const isNo = value === "0";
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
        >
            <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-text-muted" />}
                {label}
            </label>
            <div className="flex bg-surface rounded-xl p-1.5 border border-border-light gap-1">
                <button
                    type="button"
                    onClick={() => onChange("1")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${isYes
                        ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                        : "text-text-muted hover:text-text-secondary"
                        }`}
                >
                    Yes
                </button>
                <button
                    type="button"
                    onClick={() => onChange("0")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${isNo
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                        : "text-text-muted hover:text-text-secondary"
                        }`}
                >
                    No
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function PatientPredictionPage() {
    const [step, setStep] = useState<StepNumber>(1);
    const [formData, setFormData] = useState<PredictionFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictionResult, setPredictionResult] = useState<null | "Positive" | "Negative">(null);
    const [riskScore, setRiskScore] = useState(0);

    // Upload state
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [activeUploadCategory, setActiveUploadCategory] = useState<UploadCategory>("MRI");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateForm = useCallback((field: keyof PredictionFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Auto-calculate BMI
    const handleWeightOrHeight = useCallback((field: "weight" | "height", value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            const w = parseFloat(field === "weight" ? value : prev.weight);
            const h = parseFloat(field === "height" ? value : prev.height);
            if (!isNaN(w) && !isNaN(h) && h > 0) {
                const heightM = h / 100;
                updated.bmi = (w / (heightM * heightM)).toFixed(1);
            }
            return updated;
        });
    }, []);

    const nextStep = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS + 1) as StepNumber);
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as StepNumber);

    // Upload handlers
    const handleFileUpload = useCallback((files: FileList | null) => {
        if (!files) return;
        const newFiles: UploadedFile[] = Array.from(files).map((file, idx) => ({
            id: `upload-${Date.now()}-${idx}`,
            name: file.name,
            size: file.size,
            category: activeUploadCategory,
            type: file.type,
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    }, [activeUploadCategory]);

    const removeUploadedFile = useCallback((id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    }, [handleFileUpload]);

    const handlePredict = () => {
        setIsSubmitting(true);
        setStep(9 as StepNumber);
        // Simulate AI inference
        setTimeout(() => {
            setIsSubmitting(false);
            const isPositive = Math.random() > 0.5;
            setPredictionResult(isPositive ? "Positive" : "Negative");
            setRiskScore(isPositive ? Math.floor(Math.random() * 30 + 65) : Math.floor(Math.random() * 25 + 5));
        }, 3000);
    };

    const resetPrediction = () => {
        setFormData(initialFormData);
        setPredictionResult(null);
        setRiskScore(0);
        setUploadedFiles([]);
        setStep(1);
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 30, filter: "blur(4px)" },
        visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
        exit: { opacity: 0, x: -30, filter: "blur(4px)", transition: { duration: 0.25 } }
    };

    const progressPercent = ((Math.min(step, TOTAL_STEPS) - 1) / (TOTAL_STEPS - 1)) * 100;

    return (
        <div className="max-w-6xl mx-auto pb-10 space-y-6">

            {/* ──────── Header ──────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-text-primary">
                            AI Kidney Assessment
                        </h1>
                    </div>
                    <p className="text-text-muted mt-1 ml-[52px]">
                        Input your latest lab results to generate a real-time KidneyNet AI prediction.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>HIPAA Compliant</span>
                </div>
            </motion.div>

            {/* ──────── Stepper Progress ──────── */}
            {step <= TOTAL_STEPS && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-border-light p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between relative z-10">
                        {/* Connecting Line */}
                        <div className="absolute left-8 right-8 top-[24px] h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>

                        {stepsConfig.map((s) => {
                            const isActive = step === s.num;
                            const isPassed = step > s.num;
                            return (
                                <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-1">
                                    <motion.div
                                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${isActive
                                            ? `${s.borderColor} ${s.bgLight} ${s.color} shadow-lg`
                                            : isPassed
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-slate-200 bg-slate-50 text-slate-400"
                                            }`}
                                    >
                                        {isPassed ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                                    </motion.div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider hidden md:block ${isActive ? s.color : isPassed ? "text-primary" : "text-text-muted"}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Step Counter */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="font-bold text-text-muted">Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
                        <span className="font-bold text-primary">{Math.round(progressPercent)}% Complete</span>
                    </div>
                </motion.div>
            )}

            {/* ──────── Main Form Container ──────── */}
            <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden min-h-[520px] flex flex-col relative">

                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
                    <AnimatePresence mode="wait">

                        {/* ═══════ STEP 1: Demographics ═══════ */}
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center">
                                            <User className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        Demographics
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">Enter the patient&apos;s basic physical parameters.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <NumberInput label="Age" placeholder="e.g. 45" value={formData.age} onChange={(v) => updateForm("age", v)} unit="years" />

                                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Gender</label>
                                        <div className="flex bg-surface rounded-xl p-1.5 border border-border-light gap-1">
                                            {[{ l: "Male", v: "male" }, { l: "Female", v: "female" }].map(g => (
                                                <button
                                                    key={g.v}
                                                    type="button"
                                                    onClick={() => updateForm("gender", g.v)}
                                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${formData.gender === g.v
                                                        ? "bg-white shadow-md text-primary"
                                                        : "text-text-muted hover:text-text-secondary"
                                                        }`}
                                                >
                                                    {g.l}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <NumberInput label="Weight" placeholder="e.g. 70" value={formData.weight} onChange={(v) => handleWeightOrHeight("weight", v)} unit="kg" />
                                    <NumberInput label="Height" placeholder="e.g. 170" value={formData.height} onChange={(v) => handleWeightOrHeight("height", v)} unit="cm" />

                                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
                                            BMI
                                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                                Auto-calculated
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Auto-calculated"
                                                value={formData.bmi}
                                                readOnly
                                                className="w-full p-3.5 pr-16 rounded-xl border border-border-light bg-slate-50 text-sm font-medium text-text-secondary cursor-not-allowed"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted bg-white px-2 py-1 rounded-lg border border-border-light/50">
                                                kg/m²
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 2: Vital Signs ═══════ */}
                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center">
                                            <HeartPulse className="w-5 h-5 text-rose-500" />
                                        </div>
                                        Vital Signs
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">Record the patient&apos;s blood pressure readings.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                    <NumberInput label="Systolic Blood Pressure" placeholder="e.g. 120" value={formData.systolic_bp} onChange={(v) => updateForm("systolic_bp", v)} unit="mmHg" info="Upper reading" />
                                    <NumberInput label="Diastolic Blood Pressure" placeholder="e.g. 80" value={formData.diastolic_bp} onChange={(v) => updateForm("diastolic_bp", v)} unit="mmHg" info="Lower reading" />
                                </div>

                                {/* BP Info Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-4 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5 max-w-2xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <HeartPulse className="w-4 h-4 text-rose-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-rose-800 mb-1">Blood Pressure Guide</h4>
                                            <p className="text-xs text-rose-600/80 leading-relaxed">
                                                Normal BP is around 120/80 mmHg. Readings above 140/90 mmHg may indicate hypertension,
                                                which is a significant risk factor for kidney disease progression.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 3: Kidney Function Tests ═══════ */}
                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                                            <Beaker className="w-5 h-5 text-amber-500" />
                                        </div>
                                        Core Kidney Function Tests
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">
                                        These are the <span className="font-bold text-amber-600">most critical</span> biomarkers for kidney function assessment.
                                    </p>
                                </div>
                                {/* Importance Badge */}
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold w-fit">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Highest Weight in AI Model
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <NumberInput label="Serum Creatinine" placeholder="e.g. 1.2" value={formData.serum_creatinine} onChange={(v) => updateForm("serum_creatinine", v)} unit="mg/dL" step="0.1" />
                                    <NumberInput label="Blood Urea Nitrogen (BUN)" placeholder="e.g. 15" value={formData.blood_urea_nitrogen} onChange={(v) => updateForm("blood_urea_nitrogen", v)} unit="mg/dL" />
                                    <NumberInput label="eGFR" placeholder="e.g. 90" value={formData.egfr} onChange={(v) => updateForm("egfr", v)} unit="mL/min" info="Estimated Glomerular Filtration Rate" />
                                    <NumberInput label="Uric Acid" placeholder="e.g. 6.0" value={formData.uric_acid} onChange={(v) => updateForm("uric_acid", v)} unit="mg/dL" step="0.1" />
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 4: Electrolytes ═══════ */}
                        {step === 4 && (
                            <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        Electrolytes
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">Serum electrolyte levels from your metabolic panel.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <NumberInput label="Sodium" placeholder="e.g. 140" value={formData.sodium} onChange={(v) => updateForm("sodium", v)} unit="mEq/L" />
                                    <NumberInput label="Potassium" placeholder="e.g. 4.5" value={formData.potassium} onChange={(v) => updateForm("potassium", v)} unit="mEq/L" step="0.1" />
                                    <NumberInput label="Chloride" placeholder="e.g. 100" value={formData.chloride} onChange={(v) => updateForm("chloride", v)} unit="mEq/L" />
                                    <NumberInput label="Bicarbonate" placeholder="e.g. 24" value={formData.bicarbonate} onChange={(v) => updateForm("bicarbonate", v)} unit="mEq/L" />
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 5: Urine Analysis ═══════ */}
                        {step === 5 && (
                            <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                                            <Droplets className="w-5 h-5 text-blue-500" />
                                        </div>
                                        Urine Analysis
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">Metrics gathered from your recent urine sample test.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <NumberInput label="Urine Albumin" placeholder="e.g. 30" value={formData.urine_albumin} onChange={(v) => updateForm("urine_albumin", v)} unit="mg/L" />
                                    <NumberInput label="Urine Creatinine" placeholder="e.g. 100" value={formData.urine_creatinine} onChange={(v) => updateForm("urine_creatinine", v)} unit="mg/dL" />
                                    <NumberInput label="Albumin-Creatinine Ratio (ACR)" placeholder="e.g. 30" value={formData.albumin_creatinine_ratio} onChange={(v) => updateForm("albumin_creatinine_ratio", v)} unit="mg/g" />
                                    <NumberInput label="Urine Protein" placeholder="e.g. 150" value={formData.urine_protein} onChange={(v) => updateForm("urine_protein", v)} unit="mg/24h" />
                                    <NumberInput label="Urine RBC" placeholder="e.g. 3" value={formData.urine_rbc} onChange={(v) => updateForm("urine_rbc", v)} unit="cells/hpf" />
                                    <NumberInput label="Urine WBC" placeholder="e.g. 5" value={formData.urine_wbc} onChange={(v) => updateForm("urine_wbc", v)} unit="cells/hpf" />
                                    <NumberInput label="Specific Gravity" placeholder="e.g. 1.020" value={formData.specific_gravity} onChange={(v) => updateForm("specific_gravity", v)} step="0.001" />
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 6: Blood Profile ═══════ */}
                        {step === 6 && (
                            <motion.div key="step6" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center">
                                            <TestTube className="w-5 h-5 text-purple-500" />
                                        </div>
                                        Blood Profile
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">Complete Blood Count (CBC) and glucose markers.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <NumberInput label="Hemoglobin" placeholder="e.g. 14.0" value={formData.hemoglobin} onChange={(v) => updateForm("hemoglobin", v)} unit="g/dL" step="0.1" />
                                    <NumberInput label="Hematocrit" placeholder="e.g. 42" value={formData.hematocrit} onChange={(v) => updateForm("hematocrit", v)} unit="%" />
                                    <NumberInput label="WBC Count" placeholder="e.g. 7000" value={formData.wbc_count} onChange={(v) => updateForm("wbc_count", v)} unit="/µL" />
                                    <NumberInput label="Platelet Count" placeholder="e.g. 250000" value={formData.platelet_count} onChange={(v) => updateForm("platelet_count", v)} unit="/µL" />
                                    <NumberInput label="Random Blood Sugar" placeholder="e.g. 140" value={formData.random_blood_sugar} onChange={(v) => updateForm("random_blood_sugar", v)} unit="mg/dL" />
                                    <NumberInput label="HbA1c" placeholder="e.g. 5.7" value={formData.hba1c} onChange={(v) => updateForm("hba1c", v)} unit="%" step="0.1" info="Glycated Hemoglobin" />
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 7: Medical History ═══════ */}
                        {step === 7 && (
                            <motion.div key="step7" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center">
                                            <ClipboardList className="w-5 h-5 text-orange-500" />
                                        </div>
                                        Medical History
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">Pre-existing conditions and risk factors. Select Yes (1) or No (0).</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ToggleSwitch label="Diabetes" value={formData.diabetes} onChange={(v) => updateForm("diabetes", v)} icon={Activity} />
                                    <ToggleSwitch label="Hypertension" value={formData.hypertension} onChange={(v) => updateForm("hypertension", v)} icon={TrendingUp} />
                                    <ToggleSwitch label="Cardiovascular Disease" value={formData.cardiovascular_disease} onChange={(v) => updateForm("cardiovascular_disease", v)} icon={Heart} />
                                    <ToggleSwitch label="Family History of Kidney Disease" value={formData.family_history_kidney_disease} onChange={(v) => updateForm("family_history_kidney_disease", v)} icon={User} />
                                    <ToggleSwitch label="Smoking" value={formData.smoking} onChange={(v) => updateForm("smoking", v)} icon={Cigarette} />
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 8: Upload Reports (Optional) ═══════ */}
                        {step === 8 && (
                            <motion.div key="step8" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-6 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
                                            <UploadCloud className="w-5 h-5 text-violet-500" />
                                        </div>
                                        Upload Reports
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 uppercase tracking-wider">
                                            Optional
                                        </span>
                                    </h2>
                                    <p className="text-sm text-text-muted mt-2 ml-[52px]">
                                        Upload MRI scans, X-ray images, or additional medical reports to enhance AI analysis accuracy.
                                    </p>
                                </div>

                                {/* Category Selection */}
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(uploadCategoryConfig) as UploadCategory[]).map((cat) => {
                                        const cfg = uploadCategoryConfig[cat];
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setActiveUploadCategory(cat)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${activeUploadCategory === cat
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

                                {/* Drop Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging
                                        ? "border-violet-400 bg-violet-50/50"
                                        : "border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300"
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg,.dcm,.dicom,.doc,.docx"
                                        onChange={(e) => {
                                            handleFileUpload(e.target.files);
                                            e.target.value = "";
                                        }}
                                    />
                                    <motion.div
                                        animate={isDragging ? { scale: 1.05, y: -3 } : { scale: 1, y: 0 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border border-violet-200">
                                            <UploadCloud className="w-8 h-8 text-violet-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-text-primary mb-1">Drag & drop or click to browse</h3>
                                        <p className="text-sm text-text-muted max-w-sm">
                                            Supports DICOM, PNG, JPEG, PDF, and DOC. Max file size: 50MB.
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Uploaded Files List */}
                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-text-secondary flex items-center gap-2">
                                            <FileImage className="w-4 h-4" />
                                            Uploaded Files ({uploadedFiles.length})
                                        </h4>
                                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                                            <AnimatePresence>
                                                {uploadedFiles.map((file) => {
                                                    const cfg = uploadCategoryConfig[file.category];
                                                    return (
                                                        <motion.div
                                                            key={file.id}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            className="flex items-center gap-3 p-3 bg-white border border-border-light rounded-xl group hover:shadow-sm transition-all"
                                                        >
                                                            <div className={`w-10 h-10 ${cfg.bg} ${cfg.border} border rounded-lg flex items-center justify-center shrink-0`}>
                                                                <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-text-primary truncate">{file.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className={`text-[10px] font-bold ${cfg.color} ${cfg.bg} px-1.5 py-0.5 rounded ${cfg.border} border`}>
                                                                        {cfg.label}
                                                                    </span>
                                                                    <span className="text-[10px] text-text-muted font-medium">{formatFileSize(file.size)}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeUploadedFile(file.id);
                                                                }}
                                                                className="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Info Note */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-violet-800 mb-1">This step is optional</h4>
                                            <p className="text-xs text-violet-600/80 leading-relaxed">
                                                You can skip this step and proceed directly to generate a prediction using your lab results.
                                                However, uploading imaging reports can help provide a more comprehensive AI analysis.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ═══════ STEP 9: Result ═══════ */}
                        {step === (9 as StepNumber) && (
                            <motion.div key="step9" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                {isSubmitting ? (
                                    <div className="flex flex-col items-center max-w-md">
                                        <div className="relative w-28 h-28 mb-8">
                                            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            <motion.div
                                                className="absolute inset-3 rounded-full border-4 border-secondary/50 border-b-transparent"
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                            <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                                        </div>
                                        <h2 className="text-2xl font-black text-text-primary mb-3">Analyzing Biomarkers...</h2>
                                        <p className="text-text-secondary text-sm">
                                            KidneyNet AI is processing 33 clinical parameters through our deep learning inference engine.
                                        </p>
                                        <div className="mt-6 flex items-center gap-3">
                                            {["Serum Cr", "eGFR", "ACR", "HbA1c"].map((marker, i) => (
                                                <motion.span
                                                    key={marker}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                                                    className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md"
                                                >
                                                    {marker}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center w-full max-w-2xl">
                                        {/* Result Icon */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", duration: 0.6 }}
                                            className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-xl ${predictionResult === "Positive"
                                                ? "bg-gradient-to-br from-rose-100 to-red-100 text-rose-600 shadow-rose-200"
                                                : "bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600 shadow-emerald-200"
                                                }`}
                                        >
                                            {predictionResult === "Positive"
                                                ? <AlertCircle className="w-14 h-14" />
                                                : <CheckCircle2 className="w-14 h-14" />
                                            }
                                        </motion.div>

                                        {/* Risk Score Circle */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="mb-4"
                                        >
                                            <span className={`text-6xl font-black ${predictionResult === "Positive" ? "text-rose-600" : "text-emerald-500"}`}>
                                                {riskScore}%
                                            </span>
                                            <p className="text-sm font-bold text-text-muted mt-1">Risk Score</p>
                                        </motion.div>

                                        <h2 className={`text-3xl font-black mb-3 ${predictionResult === "Positive" ? "text-rose-600" : "text-emerald-500"}`}>
                                            {predictionResult === "Positive" ? "High Risk Detected" : "Low Risk Profile"}
                                        </h2>
                                        <p className="text-text-secondary mb-8 max-w-lg">
                                            {predictionResult === "Positive"
                                                ? "Our AI model indicates patterns consistent with Chronic Kidney Disease (CKD). We strongly advise sharing this report with your nephrologist immediately."
                                                : "Our AI model did not detect immediate risk patterns for Chronic Kidney Disease based on the provided 33 biomarkers."}
                                        </p>

                                        {/* Recommendations */}
                                        <div className="w-full bg-surface border border-border-light rounded-2xl p-6 text-left mb-8 shadow-sm">
                                            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5" /> Recommended Next Steps
                                            </h3>
                                            <ul className="space-y-3 text-sm text-text-secondary">
                                                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Download the PDF summary of this prediction report.</li>
                                                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Forward the inference ID to your primary care physician via Secure Chat.</li>
                                                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Upload any MRI or X-ray scans from the Medical Imaging page for further analysis.</li>
                                                {predictionResult === "Positive" && (
                                                    <li className="flex items-start gap-2 font-bold text-rose-600"><span className="text-rose-500 mt-0.5">•</span> Schedule an immediate follow-up appointment with a nephrologist.</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4">
                                            <button onClick={resetPrediction} className="px-6 py-3 rounded-xl border border-border-light bg-white text-text-secondary font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                                Run New Test
                                            </button>
                                            <button className="px-6 py-3 rounded-xl gradient-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                                                Download PDF Report
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ──────── Footer Controls ──────── */}
                {step <= TOTAL_STEPS && (
                    <div className="p-6 border-t border-border-light bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-light bg-white text-text-secondary font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="hidden md:flex items-center gap-1.5">
                            {stepsConfig.map((s) => (
                                <div
                                    key={s.num}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s.num ? "w-6 bg-primary" : step > s.num ? "bg-primary/40" : "bg-slate-200"}`}
                                />
                            ))}
                        </div>

                        {step < TOTAL_STEPS ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                            >
                                Continue <ArrowRight className="w-4 h-4 translate-y-px" />
                            </button>
                        ) : (
                            <button
                                onClick={handlePredict}
                                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 text-white font-black tracking-wide shadow-md shadow-slate-900/20 hover:bg-black transition-all"
                            >
                                <BrainCircuit className="w-5 h-5" /> Generate Prediction
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
