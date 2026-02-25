"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    UploadCloud,
    BrainCircuit,
    Droplets,
    HeartPulse,
    ClipboardList,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    TestTube,
    Pill,
    Scale,
    FileText
} from "lucide-react";

// --- Types ---
type PredictionStep = 1 | 2 | 3 | 4 | 5;

interface PredictionFormData {
    // Vitals & Basics
    age: string;
    bloodPressure: string;
    specificGravity: string;
    // Urine
    albumin: string;
    sugar: string;
    redBloodCells: "normal" | "abnormal" | "";
    pusCells: "normal" | "abnormal" | "";
    pusCellClumps: "present" | "notpresent" | "";
    bacteria: "present" | "notpresent" | "";
    // Blood Work
    bloodGlucoseRandom: string;
    bloodUrea: string;
    serumCreatinine: string;
    sodium: string;
    potassium: string;
    hemoglobin: string;
    // Clinical History
    hypertension: "yes" | "no" | "";
    diabetes: "yes" | "no" | "";
    coronaryArteryDisease: "yes" | "no" | "";
    appetite: "good" | "poor" | "";
    pedalEdema: "yes" | "no" | "";
    anemia: "yes" | "no" | "";
}

const initialFormData: PredictionFormData = {
    age: "", bloodPressure: "", specificGravity: "",
    albumin: "", sugar: "", redBloodCells: "", pusCells: "", pusCellClumps: "", bacteria: "",
    bloodGlucoseRandom: "", bloodUrea: "", serumCreatinine: "", sodium: "", potassium: "", hemoglobin: "",
    hypertension: "", diabetes: "", coronaryArteryDisease: "", appetite: "", pedalEdema: "", anemia: ""
};

export default function PatientPredictionPage() {
    const [step, setStep] = useState<PredictionStep>(1);
    const [formData, setFormData] = useState<PredictionFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictionResult, setPredictionResult] = useState<null | "Positive" | "Negative">(null);

    const updateForm = (field: keyof PredictionFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 5) as PredictionStep);
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as PredictionStep);

    const handlePredict = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setPredictionResult(Math.random() > 0.5 ? "Positive" : "Negative");
            setStep(5);
        }, 2500);
    };

    const resetPrediction = () => {
        setFormData(initialFormData);
        setPredictionResult(null);
        setStep(1);
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Run AI Assessment</h1>
                    <p className="text-text-muted mt-1">Input your latest lab results to generate a real-time KidneyNet inference.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm font-medium text-sm">
                    <UploadCloud className="w-4 h-4" />
                    Auto-Fill from Lab Report (PDF)
                </button>
            </div>

            {/* Stepper Progress */}
            {step < 5 && (
                <div className="bg-white rounded-2xl border border-border-light p-5 shadow-sm mb-6">
                    <div className="flex items-center justify-between relative relative z-10">
                        {/* Connecting Line */}
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {[
                            { num: 1, label: "Vitals", icon: HeartPulse },
                            { num: 2, label: "Urinalysis", icon: Droplets },
                            { num: 3, label: "Blood Work", icon: TestTube },
                            { num: 4, label: "History", icon: ClipboardList }
                        ].map((s) => {
                            const isActive = step === s.num;
                            const isPassed = step > s.num;
                            return (
                                <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-colors duration-300 ${isActive ? "border-primary bg-primary text-white shadow-md shadow-primary/30" :
                                            isPassed ? "border-primary bg-primary/10 text-primary" :
                                                "border-slate-200 bg-slate-50 text-slate-400"
                                        }`}>
                                        {isPassed ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive || isPassed ? "text-primary" : "text-text-muted"}`}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Form Container */}
            <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Vitals */}
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-8 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2"><HeartPulse className="w-6 h-6 text-rose-500" /> Basic Vitals</h2>
                                    <p className="text-sm text-text-muted mt-1">Enter your general physical parameters.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Patient Age (Years)</label>
                                        <input type="number" placeholder="e.g. 45" value={formData.age} onChange={(e) => updateForm("age", e.target.value)} className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Blood Pressure (mmHg)</label>
                                        <input type="number" placeholder="e.g. 120" value={formData.bloodPressure} onChange={(e) => updateForm("bloodPressure", e.target.value)} className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Specific Gravity</label>
                                        <input type="number" step="0.005" placeholder="e.g. 1.020" value={formData.specificGravity} onChange={(e) => updateForm("specificGravity", e.target.value)} className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Urinalysis */}
                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-8 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Droplets className="w-6 h-6 text-blue-500" /> Urinalysis</h2>
                                    <p className="text-sm text-text-muted mt-1">Metrics gathered from your recent urine sample test.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Albumin (0-5)</label>
                                        <select value={formData.albumin} onChange={(e) => updateForm("albumin", e.target.value)} className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                            <option value="">Select level...</option>
                                            {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Sugar (0-5)</label>
                                        <select value={formData.sugar} onChange={(e) => updateForm("sugar", e.target.value)} className="w-full p-3 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                            <option value="">Select level...</option>
                                            {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Red Blood Cells</label>
                                        <div className="flex bg-surface rounded-xl p-1 border border-border-light">
                                            <button onClick={() => updateForm("redBloodCells", "normal")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.redBloodCells === 'normal' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>Normal</button>
                                            <button onClick={() => updateForm("redBloodCells", "abnormal")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.redBloodCells === 'abnormal' ? 'bg-white shadow-sm text-rose-500' : 'text-text-muted'}`}>Abnormal</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Pus Cells</label>
                                        <div className="flex bg-surface rounded-xl p-1 border border-border-light">
                                            <button onClick={() => updateForm("pusCells", "normal")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.pusCells === 'normal' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>Normal</button>
                                            <button onClick={() => updateForm("pusCells", "abnormal")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.pusCells === 'abnormal' ? 'bg-white shadow-sm text-rose-500' : 'text-text-muted'}`}>Abnormal</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Pus Cell Clumps</label>
                                        <div className="flex bg-surface rounded-xl p-1 border border-border-light">
                                            <button onClick={() => updateForm("pusCellClumps", "present")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.pusCellClumps === 'present' ? 'bg-white shadow-sm text-rose-500' : 'text-text-muted'}`}>Present</button>
                                            <button onClick={() => updateForm("pusCellClumps", "notpresent")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.pusCellClumps === 'notpresent' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>Not Present</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Bacteria</label>
                                        <div className="flex bg-surface rounded-xl p-1 border border-border-light">
                                            <button onClick={() => updateForm("bacteria", "present")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.bacteria === 'present' ? 'bg-white shadow-sm text-rose-500' : 'text-text-muted'}`}>Present</button>
                                            <button onClick={() => updateForm("bacteria", "notpresent")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.bacteria === 'notpresent' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>Not Present</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Blood Work */}
                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-8 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2"><TestTube className="w-6 h-6 text-purple-500" /> Blood Chemistry</h2>
                                    <p className="text-sm text-text-muted mt-1">Chemical markers from your comprehensive metabolic panel.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Blood Glucose Random</label>
                                        <div className="relative">
                                            <input type="number" placeholder="e.g. 140" value={formData.bloodGlucoseRandom} onChange={(e) => updateForm("bloodGlucoseRandom", e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">mgs/dl</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Blood Urea</label>
                                        <div className="relative">
                                            <input type="number" placeholder="e.g. 36" value={formData.bloodUrea} onChange={(e) => updateForm("bloodUrea", e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">mgs/dl</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Serum Creatinine</label>
                                        <div className="relative">
                                            <input type="number" step="0.1" placeholder="e.g. 1.2" value={formData.serumCreatinine} onChange={(e) => updateForm("serumCreatinine", e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">mgs/dl</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Sodium</label>
                                        <div className="relative">
                                            <input type="number" placeholder="e.g. 140" value={formData.sodium} onChange={(e) => updateForm("sodium", e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">mEq/L</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Potassium</label>
                                        <div className="relative">
                                            <input type="number" step="0.1" placeholder="e.g. 4.5" value={formData.potassium} onChange={(e) => updateForm("potassium", e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">mEq/L</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Hemoglobin</label>
                                        <div className="relative">
                                            <input type="number" step="0.1" placeholder="e.g. 15.2" value={formData.hemoglobin} onChange={(e) => updateForm("hemoglobin", e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">gms</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Clinical History */}
                        {step === 4 && (
                            <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-6">
                                <div className="mb-8 border-b border-border-light pb-4">
                                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2"><ClipboardList className="w-6 h-6 text-amber-500" /> Patient History</h2>
                                    <p className="text-sm text-text-muted mt-1">Pre-existing conditions & symptomatic indicators.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    {[
                                        { key: "hypertension", label: "Hypertension (HTN)" },
                                        { key: "diabetes", label: "Diabetes Mellitus (DM)" },
                                        { key: "coronaryArteryDisease", label: "Coronary Artery Disease" },
                                        { key: "pedalEdema", label: "Pedal Edema" },
                                        { key: "anemia", label: "Anemia" }
                                    ].map((item) => (
                                        <div key={item.key} className="space-y-3">
                                            <label className="text-sm font-bold text-text-secondary">{item.label}</label>
                                            <div className="flex bg-surface rounded-xl p-1 border border-border-light">
                                                <button onClick={() => updateForm(item.key as keyof PredictionFormData, "yes")} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${formData[item.key as keyof PredictionFormData] === 'yes' ? 'bg-white shadow-sm text-rose-500' : 'text-text-muted'}`}>Yes</button>
                                                <button onClick={() => updateForm(item.key as keyof PredictionFormData, "no")} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${formData[item.key as keyof PredictionFormData] === 'no' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>No</button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-text-secondary">Appetite</label>
                                        <div className="flex bg-surface rounded-xl p-1 border border-border-light">
                                            <button onClick={() => updateForm("appetite", "good")} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${formData.appetite === 'good' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>Good</button>
                                            <button onClick={() => updateForm("appetite", "poor")} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${formData.appetite === 'poor' ? 'bg-white shadow-sm text-rose-500' : 'text-text-muted'}`}>Poor</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: PREDICTION RESULT */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-10">
                                {isSubmitting ? (
                                    <div className="flex flex-col items-center max-w-sm">
                                        <div className="relative w-24 h-24 mb-6">
                                            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                            <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-text-primary mb-2">Analyzing Biomarkers...</h2>
                                        <p className="text-text-secondary">KidneyNet is processing your clinical parameters through the inference engine. This may take a few seconds.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center w-full max-w-2xl">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl ${predictionResult === "Positive" ? "bg-rose-100 text-rose-600 shadow-rose-200" : "bg-emerald-100 text-emerald-600 shadow-emerald-200"}`}>
                                            {predictionResult === "Positive" ? <AlertCircle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                                        </div>
                                        <h2 className={`text-4xl font-black mb-3 ${predictionResult === "Positive" ? "text-rose-600" : "text-emerald-500"}`}>
                                            {predictionResult === "Positive" ? "High Risk Detected" : "Low Risk Profile"}
                                        </h2>
                                        <p className="text-lg text-text-secondary mb-8">
                                            {predictionResult === "Positive"
                                                ? "Our AI model indicates patterns consistent with Chronic Kidney Disease. We strongly advise sharing this report with your nephrologist immediately."
                                                : "Our AI model did not detect immediate risk patterns for Chronic Kidney Disease based on the provided metrics."}
                                        </p>

                                        <div className="w-full bg-surface border border-border-light rounded-2xl p-6 text-left mb-8 shadow-sm">
                                            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Recommended Next Steps</h3>
                                            <ul className="space-y-3 text-sm text-text-secondary">
                                                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Download this PDF summary report.</li>
                                                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Forward the inference ID to your primary care physician via Secure Chat.</li>
                                                {predictionResult === "Positive" && (
                                                    <li className="flex items-start gap-2 font-bold text-rose-600"><span className="text-rose-500 mt-0.5">•</span> Schedule an immediate follow-up appointment.</li>
                                                )}
                                            </ul>
                                        </div>

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

                {/* Footer Controls */}
                {step < 5 && (
                    <div className="p-6 border-t border-border-light bg-slate-50 flex items-center justify-between shrink-0">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-light bg-white text-text-secondary font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                            >
                                Continue <ArrowRight className="w-4 h-4 translate-y-px" />
                            </button>
                        ) : (
                            <button
                                onClick={handlePredict}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black tracking-wide shadow-md shadow-slate-900/20 hover:bg-black transition-all"
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
