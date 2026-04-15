"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
    FileText,
    Zap,
    Beaker,
    User,
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
    Trash2,
    ScanSearch,
    FlaskConical,
    Info,
    Download,
    Stethoscope,
    BarChart2,
    ListChecks,
    BadgeAlert,
    BadgeCheck
} from "lucide-react";

import { differenceInYears, parseISO, format } from "date-fns";

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

interface ReportAnalysis {
    fileId: string;
    fileName: string;
    documentType: string;
    riskLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'NORMAL' | 'INCONCLUSIVE';
    confidence: number;
    summary: string;
    kidneyFindings: Record<string, unknown>;
    conditions: Record<string, unknown>;
    ckdRiskIndicators: string[];
    recommendations: string;
    extractedFormValues: Record<string, string>;
    error?: string;
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

// ─── Helper: Build biomarker status list ────────────────────────────────────────
type BiomarkerEntry = { label: string; value: string; unit: string; status: "high" | "low" | "normal" };

function buildBiomarkerSummary(f: PredictionFormData): BiomarkerEntry[] {
    const n = (v: string) => parseFloat(v);
    const ok = (v: string) => v !== "" && !isNaN(parseFloat(v));
    const entries: BiomarkerEntry[] = [];

    const add = (
        label: string,
        field: string,
        unit: string,
        low: number,
        high: number
    ) => {
        if (!ok(field)) return;
        const val = n(field);
        entries.push({
            label,
            value: field,
            unit,
            status: val > high ? "high" : val < low ? "low" : "normal",
        });
    };

    add("Serum Creatinine", f.serum_creatinine, "mg/dL", 0.6, 1.2);
    add("BUN", f.blood_urea_nitrogen, "mg/dL", 7, 20);
    add("eGFR", f.egfr, "mL/min", 60, 120);
    add("Uric Acid", f.uric_acid, "mg/dL", 2.5, 7);
    add("Hemoglobin", f.hemoglobin, "g/dL", 12, 17);
    add("HbA1c", f.hba1c, "%", 0, 5.7);
    add("Albumin-Creatinine Ratio", f.albumin_creatinine_ratio, "mg/g", 0, 30);
    add("Urine Protein", f.urine_protein, "mg/24h", 0, 150);
    add("Systolic BP", f.systolic_bp, "mmHg", 90, 140);
    add("Sodium", f.sodium, "mEq/L", 136, 145);
    add("Potassium", f.potassium, "mEq/L", 3.5, 5.1);
    add("Random Blood Sugar", f.random_blood_sugar, "mg/dL", 70, 140);

    return entries;
}

// ─── Helper: Natural-language reasoning ─────────────────────────────────────────
function buildPredictionReasoning(
    f: PredictionFormData,
    result: string | null,
    riskScore: number
): string {
    const flags: string[] = [];
    const n = (v: string) => parseFloat(v);
    const ok = (v: string) => v !== "" && !isNaN(parseFloat(v));

    if (ok(f.serum_creatinine) && n(f.serum_creatinine) > 1.2)
        flags.push(`elevated Serum Creatinine (${f.serum_creatinine} mg/dL)`);
    if (ok(f.egfr) && n(f.egfr) < 60)
        flags.push(`reduced eGFR (${f.egfr} mL/min — below the 60 mL/min CKD threshold)`);
    if (ok(f.blood_urea_nitrogen) && n(f.blood_urea_nitrogen) > 20)
        flags.push(`high BUN (${f.blood_urea_nitrogen} mg/dL)`);
    if (ok(f.albumin_creatinine_ratio) && n(f.albumin_creatinine_ratio) > 30)
        flags.push(`elevated ACR (${f.albumin_creatinine_ratio} mg/g — indicating proteinuria)`);
    if (ok(f.urine_protein) && n(f.urine_protein) > 150)
        flags.push(`high urine protein (${f.urine_protein} mg/24h)`);
    if (ok(f.hemoglobin) && n(f.hemoglobin) < 12)
        flags.push(`low hemoglobin (${f.hemoglobin} g/dL — anaemia consistent with CKD)`);
    if (ok(f.hba1c) && n(f.hba1c) >= 6.5)
        flags.push(`HbA1c of ${f.hba1c}% (diabetic range, a primary CKD driver)`);
    if (ok(f.systolic_bp) && n(f.systolic_bp) >= 140)
        flags.push(`hypertensive systolic BP (${f.systolic_bp} mmHg)`);
    if (f.diabetes === "1") flags.push("confirmed diabetes mellitus");
    if (f.hypertension === "1") flags.push("confirmed hypertension");
    if (f.family_history_kidney_disease === "1") flags.push("family history of kidney disease");

    if (result === "Positive") {
        if (flags.length === 0) {
            return `The KidneyNet AI model assigned a CKD risk score of ${riskScore}% based on the combined pattern of your biomarkers. Even when individual values appear borderline, the model detected a multi-parameter pattern indicative of early-stage Chronic Kidney Disease.`;
        }
        return `The model assigned a CKD risk score of ${riskScore}% primarily driven by: ${flags.join("; ")}. These values, assessed together through the KidneyNet neural network, are consistent with Chronic Kidney Disease. Prompt nephrological evaluation is strongly recommended.`;
    } else {
        if (flags.length === 0) {
            return `All assessed biomarkers fall within clinically normal ranges. The KidneyNet AI model assigned a low CKD risk score of ${riskScore}%, indicating no significant indicators of Chronic Kidney Disease at this time. Continue routine annual screening.`;
        }
        return `While the model noted some sub-threshold variations — ${flags.join("; ")} — the overall biomarker pattern yielded a low CKD risk score of ${riskScore}%. No definitive CKD diagnosis is indicated. These values should be monitored at your next routine check-up.`;
    }
}

// ─── Helper: Download hospital PDF report ───────────────────────────────────────
async function downloadPDFReport(
    f: PredictionFormData,
    result: string | null,
    riskScore: number,
    confidence: number
) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = 210;
    const pageH = 297;
    const margin = 18;
    const col2 = pageW / 2 + 5;
    let y = 0;

    const hex2rgb = (hex: string): [number, number, number] => {
        const h = hex.replace("#", "");
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };

    const isPositive = result === "Positive";

    // ── Header Background ──
    doc.setFillColor(...(isPositive ? hex2rgb("#b91c1c") : hex2rgb("#065f46")));
    doc.rect(0, 0, pageW, 50, "F");

    // Hospital name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("MediIntel Kidney Health Centre", margin, 18);

    // Subtitle
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 255, 200);
    doc.text("AI-Powered Nephrology Assessment Report  ·  Powered by KidneyNet v2", margin, 26);

    // Date
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Date: ${dateStr}`, pageW - margin, 18, { align: "right" });
    doc.text(`Ref: KN-${Date.now().toString().slice(-8)}`, pageW - margin, 24, { align: "right" });

    // Verdict box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 32, pageW - margin * 2, 14, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...(isPositive ? hex2rgb("#b91c1c") : hex2rgb("#065f46")));
    doc.text(
        isPositive ? `\u26a0  CKD DETECTED   |   Risk Score: ${riskScore}%   |   Confidence: ${confidence}%` : `\u2713  NO CKD DETECTED   |   Risk Score: ${riskScore}%   |   Confidence: ${confidence}%`,
        pageW / 2, 41, { align: "center" }
    );

    y = 58;

    // ── Section helper ──
    const sectionHeader = (title: string) => {
        doc.setFillColor(...hex2rgb("#1e293b"));
        doc.rect(margin, y, pageW - margin * 2, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(title.toUpperCase(), margin + 3, y + 5);
        y += 10;
    };

    const row = (label: string, value: string, x: number, colW: number, shade: boolean) => {
        if (shade) {
            doc.setFillColor(245, 247, 250);
            doc.rect(x, y - 1, colW, 7, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(label, x + 2, y + 4);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(value || "—", x + colW - 3, y + 4, { align: "right" });
        y += 7;
    };

    // ── Patient Demographics ──
    sectionHeader("Patient Demographics");
    const demoColW = (pageW - margin * 2) / 2;
    const demoLeft = margin;
    const demoRight = margin + demoColW;
    const saveY = y;
    let ly = y;
    [
        ["Age", f.age ? `${f.age} years` : "—"],
        ["Gender", f.gender || "—"],
        ["Weight", f.weight ? `${f.weight} kg` : "—"],
        ["Height", f.height ? `${f.height} cm` : "—"],
        ["BMI", f.bmi ? `${f.bmi} kg/m2` : "—"],
    ].forEach(([label, value], i) => { y = saveY + i * 7; row(label, value, demoLeft, demoColW, i % 2 === 0); });
    let ry = saveY;
    [
        ["Systolic BP", f.systolic_bp ? `${f.systolic_bp} mmHg` : "—"],
        ["Diastolic BP", f.diastolic_bp ? `${f.diastolic_bp} mmHg` : "—"],
        ["Diabetes", f.diabetes === "1" ? "Yes" : f.diabetes === "0" ? "No" : "—"],
        ["Hypertension", f.hypertension === "1" ? "Yes" : f.hypertension === "0" ? "No" : "—"],
        ["Smoking", f.smoking === "1" ? "Yes" : f.smoking === "0" ? "No" : "—"],
    ].forEach(([label, value], i) => { y = ry + i * 7; row(label, value, demoRight, demoColW, i % 2 === 0); });
    y = saveY + 5 * 7;

    // ── Kidney Function Tests ──
    sectionHeader("Core Kidney Function Tests");
    const kfSave = y;
    [["Serum Creatinine", f.serum_creatinine ? `${f.serum_creatinine} mg/dL` : "—"],
     ["BUN", f.blood_urea_nitrogen ? `${f.blood_urea_nitrogen} mg/dL` : "—"],
     ["eGFR", f.egfr ? `${f.egfr} mL/min` : "—"],
     ["Uric Acid", f.uric_acid ? `${f.uric_acid} mg/dL` : "—"],
    ].forEach(([label, value], i) => { y = kfSave + i * 7; row(label, value, margin, (pageW - margin * 2) / 2, i % 2 === 0); });
    let kfRy = kfSave;
    [["Sodium", f.sodium ? `${f.sodium} mEq/L` : "—"],
     ["Potassium", f.potassium ? `${f.potassium} mEq/L` : "—"],
     ["Chloride", f.chloride ? `${f.chloride} mEq/L` : "—"],
     ["Bicarbonate", f.bicarbonate ? `${f.bicarbonate} mEq/L` : "—"],
    ].forEach(([label, value], i) => { y = kfRy + i * 7; row(label, value, col2 - 5, (pageW - margin * 2) / 2, i % 2 === 0); });
    y = kfSave + 4 * 7;

    // ── Urine Analysis ──
    sectionHeader("Urine Analysis");
    const urSave = y;
    [["Urine Albumin", f.urine_albumin ? `${f.urine_albumin} mg/L` : "—"],
     ["Urine Creatinine", f.urine_creatinine ? `${f.urine_creatinine} mg/dL` : "—"],
     ["ACR", f.albumin_creatinine_ratio ? `${f.albumin_creatinine_ratio} mg/g` : "—"],
     ["Urine Protein", f.urine_protein ? `${f.urine_protein} mg/24h` : "—"],
    ].forEach(([label, value], i) => { y = urSave + i * 7; row(label, value, margin, (pageW - margin * 2) / 2, i % 2 === 0); });
    let urRy = urSave;
    [["Urine RBC", f.urine_rbc ? `${f.urine_rbc} cells/hpf` : "—"],
     ["Urine WBC", f.urine_wbc ? `${f.urine_wbc} cells/hpf` : "—"],
     ["Specific Gravity", f.specific_gravity || "—"],
    ].forEach(([label, value], i) => { y = urRy + i * 7; row(label, value, col2 - 5, (pageW - margin * 2) / 2, i % 2 === 0); });
    y = urSave + 4 * 7;

    // ── Blood Profile ──
    sectionHeader("Blood Profile");
    const bpSave = y;
    [["Hemoglobin", f.hemoglobin ? `${f.hemoglobin} g/dL` : "—"],
     ["Hematocrit", f.hematocrit ? `${f.hematocrit}%` : "—"],
     ["WBC Count", f.wbc_count ? `${f.wbc_count} /uL` : "—"],
    ].forEach(([label, value], i) => { y = bpSave + i * 7; row(label, value, margin, (pageW - margin * 2) / 2, i % 2 === 0); });
    let bpRy = bpSave;
    [["Platelets", f.platelet_count ? `${f.platelet_count} /uL` : "—"],
     ["Random Blood Sugar", f.random_blood_sugar ? `${f.random_blood_sugar} mg/dL` : "—"],
     ["HbA1c", f.hba1c ? `${f.hba1c}%` : "—"],
    ].forEach(([label, value], i) => { y = bpRy + i * 7; row(label, value, col2 - 5, (pageW - margin * 2) / 2, i % 2 === 0); });
    y = bpSave + 3 * 7;

    // ── Medical History ──
    sectionHeader("Medical History");
    const mhSave = y;
    [["Diabetes", f.diabetes === "1" ? "Yes" : f.diabetes === "0" ? "No" : "—"],
     ["Hypertension", f.hypertension === "1" ? "Yes" : f.hypertension === "0" ? "No" : "—"],
     ["Cardiovascular Disease", f.cardiovascular_disease === "1" ? "Yes" : f.cardiovascular_disease === "0" ? "No" : "—"],
    ].forEach(([label, value], i) => { y = mhSave + i * 7; row(label, value, margin, (pageW - margin * 2) / 2, i % 2 === 0); });
    let mhRy = mhSave;
    [["Family History (Kidney)", f.family_history_kidney_disease === "1" ? "Yes" : f.family_history_kidney_disease === "0" ? "No" : "—"],
     ["Smoking", f.smoking === "1" ? "Yes" : f.smoking === "0" ? "No" : "—"],
    ].forEach(([label, value], i) => { y = mhRy + i * 7; row(label, value, col2 - 5, (pageW - margin * 2) / 2, i % 2 === 0); });
    y = mhSave + 3 * 7 + 4;

    // ── Basis of Prediction ──
    sectionHeader("Basis of AI Prediction");
    const reasoning = buildPredictionReasoning(f, result, riskScore);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const reasonLines = doc.splitTextToSize(reasoning, pageW - margin * 2 - 4);
    doc.text(reasonLines, margin + 2, y + 1);
    y += reasonLines.length * 4.5 + 4;

    // ── Recommendations ──
    sectionHeader(isPositive ? "Urgent Recommendations" : "Recommendations");
    const recs = isPositive
        ? ["1. Consult a nephrologist immediately — do not delay.",
           "2. Repeat serum creatinine and eGFR in 1–2 weeks to confirm.",
           "3. Start dietary modifications: low sodium, low potassium, adequate hydration.",
           "4. If diabetic, optimise glycaemic control urgently.",
           "5. Avoid nephrotoxic medications (NSAIDs, contrast agents) without medical guidance.",
           "6. Undergo renal ultrasound within the next 7 days."]
        : ["1. Maintain healthy lifestyle: balanced diet, regular exercise, adequate hydration.",
           "2. Monitor blood pressure. Target <130/80 mmHg.",
           "3. Annual kidney function panel (creatinine, eGFR, urine ACR) is recommended.",
           "4. If diabetic, maintain HbA1c < 7%.",
           "5. Avoid prolonged use of NSAIDs."];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    recs.forEach((rec) => {
        doc.text(rec, margin + 2, y);
        y += 6;
    });

    // ── Footer ──
    y = pageH - 18;
    doc.setFillColor(...hex2rgb("#f1f5f9"));
    doc.rect(0, y - 2, pageW, 20, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
        "DISCLAIMER: This AI-generated report is for clinical decision support only and does not constitute a medical diagnosis. " +
        "Consult a qualified nephrologist before any treatment decisions.",
        pageW / 2, y + 4, { align: "center", maxWidth: pageW - margin * 2 }
    );
    doc.setFont("helvetica", "normal");
    doc.text("KidneyNet AI  ·  MediIntel Healthcare  ·  Report generated on " + dateStr, pageW / 2, y + 10, { align: "center" });

    doc.save(`KidneyNet_Report_${Date.now()}.pdf`);
}

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function PatientPredictionPage() {
    const [step, setStep] = useState<StepNumber>(1);
    const [formData, setFormData] = useState<PredictionFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictionResult, setPredictionResult] = useState<null | "Positive" | "Negative">(null);
    const [riskScore, setRiskScore] = useState(0);
    const [confidence, setConfidence] = useState(0);
    const [predictionId, setPredictionId] = useState<string | null>(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [predictionError, setPredictionError] = useState<string | null>(null);

    // Initial load for demographics
    useEffect(() => {
        fetch('/api/patient/profile')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.profile) {
                    const prof = data.profile;
                    setFormData(prev => ({
                        ...prev,
                        age: prof.date_of_birth && prof.date_of_birth !== '1990-01-01T00:00:00.000Z' ? differenceInYears(new Date(), parseISO(prof.date_of_birth)).toString() : prev.age,
                        gender: prof.gender ? prof.gender.toLowerCase() : prev.gender
                    }));
                }
            })
            .catch(err => console.error("Error fetching patient base profile", err));
    }, []);

    // Upload state
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [activeUploadCategory, setActiveUploadCategory] = useState<UploadCategory>("MRI");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Actual File objects stored in a ref (not state) to avoid re-render overhead
    const fileObjectsRef = useRef<Map<string, File>>(new Map());
    // Report analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [reportAnalyses, setReportAnalyses] = useState<ReportAnalysis[]>([]);

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
        const newFiles: UploadedFile[] = Array.from(files).map((file, idx) => {
            const id = `upload-${Date.now()}-${idx}`;
            fileObjectsRef.current.set(id, file);   // store actual File
            return { id, name: file.name, size: file.size, category: activeUploadCategory, type: file.type };
        });
        setUploadedFiles(prev => [...prev, ...newFiles]);
        setReportAnalyses([]);   // reset analyses when new files are added
    }, [activeUploadCategory]);

    const removeUploadedFile = useCallback((id: string) => {
        fileObjectsRef.current.delete(id);
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
        setReportAnalyses(prev => prev.filter(a => a.fileId !== id));
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

    const handlePredict = async () => {
        setIsSubmitting(true);
        setPredictionError(null);
        setPredictionResult(null);
        setStep(9 as StepNumber);

        try {
            const res = await fetch('/api/patient/prediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setPredictionResult(data.isPositive ? "Positive" : "Negative");
                setRiskScore(data.riskScore);       // real risk score 0-100
                setConfidence(data.confidence);     // real model confidence 0-100
                setPredictionId(data.prediction_id || null);
                setFeedbackSubmitted(false);
            } else {
                // Surface the real error — no fake random fallback
                setPredictionError(
                    data.message ||
                    'The prediction could not be completed. Please try again.'
                );
            }
        } catch (e) {
            console.error('Prediction API error', e);
            setPredictionError(
                'Unable to reach the AI service. ' +
                'Please make sure the Python Flask server is running on port 5000 and try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Report Analysis ────────────────────────────────────────────────────────
    const analyzeReports = async () => {
        if (uploadedFiles.length === 0 || isAnalyzing) return;
        setIsAnalyzing(true);
        setReportAnalyses([]);

        const results: ReportAnalysis[] = [];
        const mergedValues: Record<string, string> = {};

        for (const uf of uploadedFiles) {
            const file = fileObjectsRef.current.get(uf.id);
            if (!file) continue;

            const fd = new FormData();
            fd.append('file', file);

            try {
                const res = await fetch('/api/patient/prediction/analyze-report', {
                    method: 'POST', body: fd
                });
                const data = await res.json();

                if (data.success) {
                    results.push({
                        fileId: uf.id,
                        fileName: uf.name,
                        documentType: data.document_type ?? 'UNKNOWN',
                        riskLevel: data.risk_level ?? 'INCONCLUSIVE',
                        confidence: data.analysis_confidence ?? 0,
                        summary: data.summary ?? '',
                        kidneyFindings: data.kidney_findings ?? {},
                        conditions: data.conditions ?? {},
                        ckdRiskIndicators: data.ckd_risk_indicators ?? [],
                        recommendations: data.recommendations ?? '',
                        extractedFormValues: data.extracted_form_values ?? {},
                    });
                    // Merge extracted values (later files override earlier)
                    Object.assign(mergedValues, data.extracted_form_values ?? {});
                } else {
                    results.push({
                        fileId: uf.id, fileName: uf.name,
                        documentType: 'ERROR', riskLevel: 'INCONCLUSIVE',
                        confidence: 0, summary: '', kidneyFindings: {},
                        conditions: {}, ckdRiskIndicators: [],
                        recommendations: '',
                        extractedFormValues: {},
                        error: data.message ?? data.error ?? 'Analysis failed',
                    });
                }
            } catch (e) {
                results.push({
                    fileId: uf.id, fileName: uf.name,
                    documentType: 'ERROR', riskLevel: 'INCONCLUSIVE',
                    confidence: 0, summary: '', kidneyFindings: {},
                    conditions: {}, ckdRiskIndicators: [],
                    recommendations: '',
                    extractedFormValues: {},
                    error: 'Network error — could not reach analysis service.',
                });
            }
        }

        setReportAnalyses(results);

        // Auto-populate form fields from extracted report values
        if (Object.keys(mergedValues).length > 0) {
            setFormData(prev => ({ ...prev, ...mergedValues }));
        }

        setIsAnalyzing(false);
    };

    const resetPrediction = () => {
        setFormData(initialFormData);
        setPredictionResult(null);
        setPredictionError(null);
        setRiskScore(0);
        setConfidence(0);
        setPredictionId(null);
        setFeedbackSubmitted(false);
        setUploadedFiles([]);
        setReportAnalyses([]);
        fileObjectsRef.current.clear();
        setStep(1);
    };

    const submitFeedback = async (isCorrect: boolean) => {
        if (!predictionId) return;
        try {
            await fetch('/api/patient/prediction/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prediction_id: predictionId, is_correct: isCorrect })
            });
            setFeedbackSubmitted(true);
        } catch (e) {
            console.error('Feedback error', e);
        }
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
                                    <NumberInput label="Systolic Blood Pressure" placeholder="e.g. 120" value={formData.systolic_bp} onChange={(v) => updateForm("systolic_bp", v)} unit="mmHg" info="Normal: 90-120, High: >140" />
                                    <NumberInput label="Diastolic Blood Pressure" placeholder="e.g. 80" value={formData.diastolic_bp} onChange={(v) => updateForm("diastolic_bp", v)} unit="mmHg" info="Normal: 60-80, High: >90" />
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
                                    <NumberInput label="Serum Creatinine" placeholder="e.g. 1.2" value={formData.serum_creatinine} onChange={(v) => updateForm("serum_creatinine", v)} unit="mg/dL" step="0.1" info="Normal: 0.6-1.2, High: >1.2" />
                                    <NumberInput label="Blood Urea Nitrogen (BUN)" placeholder="e.g. 15" value={formData.blood_urea_nitrogen} onChange={(v) => updateForm("blood_urea_nitrogen", v)} unit="mg/dL" info="Normal: 7-20, High: >20" />
                                    <NumberInput label="eGFR" placeholder="e.g. 90" value={formData.egfr} onChange={(v) => updateForm("egfr", v)} unit="mL/min" info="Normal: >90, Low (CKD risk): <60" />
                                    <NumberInput label="Uric Acid" placeholder="e.g. 6.0" value={formData.uric_acid} onChange={(v) => updateForm("uric_acid", v)} unit="mg/dL" step="0.1" info="Normal: 2.5-7.0, High: >7.0" />
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
                                    <NumberInput label="Sodium" placeholder="e.g. 140" value={formData.sodium} onChange={(v) => updateForm("sodium", v)} unit="mEq/L" info="Normal: 136-145" />
                                    <NumberInput label="Potassium" placeholder="e.g. 4.5" value={formData.potassium} onChange={(v) => updateForm("potassium", v)} unit="mEq/L" step="0.1" info="Normal: 3.5-5.1" />
                                    <NumberInput label="Chloride" placeholder="e.g. 100" value={formData.chloride} onChange={(v) => updateForm("chloride", v)} unit="mEq/L" info="Normal: 96-106" />
                                    <NumberInput label="Bicarbonate" placeholder="e.g. 24" value={formData.bicarbonate} onChange={(v) => updateForm("bicarbonate", v)} unit="mEq/L" info="Normal: 22-29" />
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
                                    <NumberInput label="Urine Albumin" placeholder="e.g. 30" value={formData.urine_albumin} onChange={(v) => updateForm("urine_albumin", v)} unit="mg/L" info="Normal: <30" />
                                    <NumberInput label="Urine Creatinine" placeholder="e.g. 100" value={formData.urine_creatinine} onChange={(v) => updateForm("urine_creatinine", v)} unit="mg/dL" info="Normal: 20-320" />
                                    <NumberInput label="Albumin-Creatinine Ratio (ACR)" placeholder="e.g. 30" value={formData.albumin_creatinine_ratio} onChange={(v) => updateForm("albumin_creatinine_ratio", v)} unit="mg/g" info="Normal: <30, High: >30" />
                                    <NumberInput label="Urine Protein" placeholder="e.g. 150" value={formData.urine_protein} onChange={(v) => updateForm("urine_protein", v)} unit="mg/24h" info="Normal: <150" />
                                    <NumberInput label="Urine RBC" placeholder="e.g. 3" value={formData.urine_rbc} onChange={(v) => updateForm("urine_rbc", v)} unit="cells/hpf" info="Normal: 0-3" />
                                    <NumberInput label="Urine WBC" placeholder="e.g. 5" value={formData.urine_wbc} onChange={(v) => updateForm("urine_wbc", v)} unit="cells/hpf" info="Normal: 0-5" />
                                    <NumberInput label="Specific Gravity" placeholder="e.g. 1.020" value={formData.specific_gravity} onChange={(v) => updateForm("specific_gravity", v)} step="0.001" info="Normal: 1.005-1.030" />
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
                                    <NumberInput label="Hemoglobin" placeholder="e.g. 14.0" value={formData.hemoglobin} onChange={(v) => updateForm("hemoglobin", v)} unit="g/dL" step="0.1" info="Normal: 12-17, Low: <12" />
                                    <NumberInput label="Hematocrit" placeholder="e.g. 42" value={formData.hematocrit} onChange={(v) => updateForm("hematocrit", v)} unit="%" info="Normal: 36-50%" />
                                    <NumberInput label="WBC Count" placeholder="e.g. 7000" value={formData.wbc_count} onChange={(v) => updateForm("wbc_count", v)} unit="/µL" info="Normal: 4500-11000" />
                                    <NumberInput label="Platelet Count" placeholder="e.g. 250000" value={formData.platelet_count} onChange={(v) => updateForm("platelet_count", v)} unit="/µL" info="Normal: 150k-450k" />
                                    <NumberInput label="Random Blood Sugar" placeholder="e.g. 140" value={formData.random_blood_sugar} onChange={(v) => updateForm("random_blood_sugar", v)} unit="mg/dL" info="Normal: <140, High: >200" />
                                    <NumberInput label="HbA1c" placeholder="e.g. 5.7" value={formData.hba1c} onChange={(v) => updateForm("hba1c", v)} unit="%" step="0.1" info="Normal: <5.7, High: >6.5" />
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

                                {/* ── Analyze Button ── */}
                                {uploadedFiles.length > 0 && !isAnalyzing && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                        <button
                                            type="button"
                                            onClick={analyzeReports}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-base shadow-lg shadow-violet-300 hover:shadow-violet-400 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            <ScanSearch className="w-5 h-5" />
                                            Analyze {uploadedFiles.length} Report{uploadedFiles.length > 1 ? 's' : ''} with AI
                                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Gemini Vision</span>
                                        </button>
                                        {reportAnalyses.length === 0 && (
                                            <p className="text-center text-xs text-text-muted mt-2">
                                                AI will extract clinical values and auto-fill your form
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* ── Analyzing spinner ── */}
                                {isAnalyzing && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-3 py-6"
                                    >
                                        <motion.div
                                            className="w-14 h-14 rounded-full border-4 border-violet-200 border-t-violet-600"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <p className="text-sm font-bold text-violet-700">Gemini AI is analyzing your reports…</p>
                                        <p className="text-xs text-text-muted">This may take 15-30 seconds per file</p>
                                    </motion.div>
                                )}

                                {/* ── Analysis Results ── */}
                                {reportAnalyses.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-text-primary flex items-center gap-2">
                                                <FlaskConical className="w-4 h-4 text-violet-600" />
                                                AI Analysis Results
                                            </h4>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                                                Form auto-filled ✓
                                            </span>
                                        </div>

                                        {reportAnalyses.map((analysis) => {
                                            const riskColor = {
                                                HIGH: 'bg-rose-50 border-rose-200 text-rose-700',
                                                MODERATE: 'bg-amber-50 border-amber-200 text-amber-700',
                                                LOW: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                                NORMAL: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                                INCONCLUSIVE: 'bg-slate-50 border-slate-200 text-slate-600',
                                            }[analysis.riskLevel] ?? 'bg-slate-50 border-slate-200 text-slate-600';

                                            return (
                                                <div key={analysis.fileId} className="bg-white border border-border-light rounded-2xl p-5 shadow-sm">
                                                    {/* File header */}
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                                                                <FileImage className="w-4 h-4 text-violet-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-text-primary truncate">{analysis.fileName}</p>
                                                                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{analysis.documentType.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                        {!analysis.error && (
                                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${riskColor}`}>
                                                                {analysis.riskLevel} RISK
                                                            </span>
                                                        )}
                                                    </div>

                                                    {analysis.error ? (
                                                        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3">
                                                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                            <p className="text-xs text-rose-700">{analysis.error}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Summary */}
                                                            {analysis.summary && (
                                                                <p className="text-xs text-text-secondary leading-relaxed mb-3">{analysis.summary}</p>
                                                            )}

                                                            {/* Extracted values count */}
                                                            {Object.keys(analysis.extractedFormValues).length > 0 && (
                                                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-3">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                    <span className="text-xs font-bold text-emerald-700">
                                                                        {Object.keys(analysis.extractedFormValues).length} clinical values extracted &amp; auto-filled into your form
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Risk indicators */}
                                                            {analysis.ckdRiskIndicators.length > 0 && (
                                                                <div className="space-y-1.5 mb-3">
                                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">CKD Risk Indicators Found</p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {analysis.ckdRiskIndicators.map((ind, i) => (
                                                                            <span key={i} className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                                                                                {ind}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Recommendations */}
                                                            {analysis.recommendations && (
                                                                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                                                                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                                                    <p className="text-xs text-blue-700 leading-relaxed">{analysis.recommendations}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Re-analyze button */}
                                        <button
                                            type="button"
                                            onClick={analyzeReports}
                                            className="w-full py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-bold hover:bg-violet-100 transition-colors"
                                        >
                                            Re-analyze Reports
                                        </button>
                                    </motion.div>
                                )}

                                {/* Info Note */}
                                {reportAnalyses.length === 0 && !isAnalyzing && (
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
                                                <h4 className="font-bold text-sm text-violet-800 mb-1">AI Report Analysis</h4>
                                                <p className="text-xs text-violet-600/80 leading-relaxed">
                                                    Upload X-rays, MRI scans, or PDF lab reports and click
                                                    &ldquo;Analyze with AI&rdquo;. Gemini Vision will extract clinical values
                                                    and auto-fill your form — improving prediction accuracy.
                                                    This step is optional.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══════ STEP 9: Result ═══════ */}
                        {step === (9 as StepNumber) && (
                            <motion.div key="step9" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center py-6">

                                {/* ── Error State ── */}
                                {!isSubmitting && predictionError && (
                                    <div className="flex flex-col items-center max-w-md text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-200">
                                            <AlertCircle className="w-12 h-12 text-amber-500" />
                                        </div>
                                        <h2 className="text-2xl font-black text-text-primary mb-3">Prediction Failed</h2>
                                        <p className="text-text-secondary text-sm mb-6 leading-relaxed">{predictionError}</p>
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-700 font-medium mb-6 w-full">
                                            <p className="font-bold mb-1">💡 Checklist:</p>
                                            <ul className="space-y-1">
                                                <li>• Python Flask service is running: <code className="bg-amber-100 px-1 rounded">python app.py</code></li>
                                                <li>• Flask is on port <strong>5000</strong></li>
                                                <li>• <code className="bg-amber-100 px-1 rounded">tunned_kidney_Cancer_model.pkl</code> is in the Prediction Model folder</li>
                                                <li>• <code className="bg-amber-100 px-1 rounded">flask-cors</code> is installed: <code className="bg-amber-100 px-1 rounded">pip install flask-cors</code></li>
                                            </ul>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={resetPrediction}
                                                className="px-5 py-2.5 rounded-xl border border-border-light bg-white text-text-secondary font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                            >
                                                Start Over
                                            </button>
                                            <button
                                                onClick={() => { setPredictionError(null); setStep(8 as StepNumber); }}
                                                className="px-5 py-2.5 rounded-xl gradient-primary text-white font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isSubmitting ? (
                                    <div className="flex flex-col items-center max-w-md text-center">
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
                                ) : !predictionError ? (
                                    <div className="flex flex-col items-center w-full max-w-3xl">

                                        {/* ══ VERDICT BANNER ══ */}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", duration: 0.7 }}
                                            className={`w-full rounded-3xl p-6 mb-6 flex items-center gap-5 shadow-xl ${
                                                predictionResult === "Positive"
                                                    ? "bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-300"
                                                    : "bg-gradient-to-r from-emerald-600 to-green-600 shadow-emerald-300"
                                            }`}
                                        >
                                            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                                {predictionResult === "Positive"
                                                    ? <BadgeAlert className="w-10 h-10 text-white" />
                                                    : <BadgeCheck className="w-10 h-10 text-white" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">AI Diagnosis Result</p>
                                                <h2 className="text-3xl font-black text-white leading-none">
                                                    {predictionResult === "Positive" ? "CKD Detected" : "No CKD Detected"}
                                                </h2>
                                                <p className="text-white/80 text-sm mt-1 font-medium">
                                                    {predictionResult === "Positive"
                                                        ? "Chronic Kidney Disease indicators found — immediate nephrology consult advised."
                                                        : "No significant CKD risk patterns detected in your biomarker profile."}
                                                </p>
                                            </div>
                                            <div className="ml-auto text-right shrink-0">
                                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Risk Score</p>
                                                <p className="text-4xl font-black text-white">{riskScore}%</p>
                                                {confidence > 0 && (
                                                    <p className="text-white/70 text-xs font-semibold mt-1">Confidence: {confidence}%</p>
                                                )}
                                                {predictionResult === "Positive" && (
                                                    <p className="text-white/90 text-sm font-black mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/20">
                                                        {riskScore >= 90 ? "Stage 4/5 CKD Risk" : riskScore >= 70 ? "Stage 3 CKD Risk" : "Stage 1/2 CKD Risk"}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* ══ CLINICAL SUMMARY REPORT ══ */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="w-full bg-white border border-border-light rounded-3xl shadow-sm overflow-hidden mb-6"
                                        >
                                            {/* Report Header */}
                                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                                                        <Stethoscope className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-white text-lg leading-none">Clinical Summary Report</h3>
                                                        <p className="text-slate-400 text-xs mt-0.5">KidneyNet AI · Basis of Prediction</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Date</p>
                                                    <p className="text-white text-xs font-bold">{format(new Date(), "MMM d, yyyy")}</p>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-6">

                                                {/* Key Biomarkers Panel */}
                                                <div>
                                                    <h4 className="text-xs font-black text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <BarChart2 className="w-3.5 h-3.5" />
                                                        Key Biomarkers Analysed
                                                    </h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {buildBiomarkerSummary(formData).map((bm) => (
                                                            <div
                                                                key={bm.label}
                                                                className={`rounded-xl p-3 border ${
                                                                    bm.status === "high" ? "bg-rose-50 border-rose-200"
                                                                    : bm.status === "low"  ? "bg-amber-50 border-amber-200"
                                                                    : "bg-emerald-50 border-emerald-200"
                                                                }`}
                                                            >
                                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">{bm.label}</p>
                                                                <p className={`text-lg font-black leading-tight mt-0.5 ${
                                                                    bm.status === "high" ? "text-rose-700"
                                                                    : bm.status === "low"  ? "text-amber-700"
                                                                    : "text-emerald-700"
                                                                }`}>{bm.value} <span className="text-[10px] font-semibold">{bm.unit}</span></p>
                                                                <p className={`text-[10px] font-bold mt-0.5 ${
                                                                    bm.status === "high" ? "text-rose-600"
                                                                    : bm.status === "low"  ? "text-amber-600"
                                                                    : "text-emerald-600"
                                                                }`}>
                                                                    {bm.status === "high" ? "⬆ Above Normal"
                                                                     : bm.status === "low"  ? "⬇ Below Normal"
                                                                     : "✓ Normal Range"}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Reasoning Text */}
                                                <div className={`rounded-2xl p-5 border ${
                                                    predictionResult === "Positive"
                                                        ? "bg-rose-50 border-rose-200"
                                                        : "bg-emerald-50 border-emerald-200"
                                                }`}>
                                                    <h4 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2 ${
                                                        predictionResult === "Positive" ? "text-rose-700" : "text-emerald-700"
                                                    }`}>
                                                        <ListChecks className="w-3.5 h-3.5" />
                                                        Basis of Prediction
                                                    </h4>
                                                    <p className={`text-sm leading-relaxed ${
                                                        predictionResult === "Positive" ? "text-rose-800" : "text-emerald-800"
                                                    }`}>
                                                        {buildPredictionReasoning(formData, predictionResult, riskScore)}
                                                    </p>
                                                </div>

                                                {/* Risk Factors Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-surface border border-border-light rounded-2xl p-4">
                                                        <h4 className="text-xs font-black text-text-muted uppercase tracking-wider mb-3">Medical History Factors</h4>
                                                        <div className="space-y-2">
                                                            {[
                                                                { label: "Diabetes",       val: formData.diabetes },
                                                                { label: "Hypertension",   val: formData.hypertension },
                                                                { label: "Cardiovascular", val: formData.cardiovascular_disease },
                                                                { label: "Family History", val: formData.family_history_kidney_disease },
                                                                { label: "Smoking",        val: formData.smoking },
                                                            ].map(f => (
                                                                <div key={f.label} className="flex items-center justify-between">
                                                                    <span className="text-xs font-semibold text-text-secondary">{f.label}</span>
                                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                                                        f.val === "1" ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                        : f.val === "0" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                        : "bg-slate-50 text-slate-500 border-slate-200"
                                                                    }`}>
                                                                        {f.val === "1" ? "Yes" : f.val === "0" ? "No" : "N/A"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="bg-surface border border-border-light rounded-2xl p-4">
                                                        <h4 className="text-xs font-black text-text-muted uppercase tracking-wider mb-3">Patient Demographics</h4>
                                                        <div className="space-y-2">
                                                            {[
                                                                { label: "Age",    val: formData.age,    unit: "years" },
                                                                { label: "Gender", val: formData.gender, unit: "" },
                                                                { label: "BMI",    val: formData.bmi,    unit: "kg/m²" },
                                                                { label: "Systolic BP",  val: formData.systolic_bp,  unit: "mmHg" },
                                                                { label: "Diastolic BP", val: formData.diastolic_bp, unit: "mmHg" },
                                                            ].map(f => (
                                                                <div key={f.label} className="flex items-center justify-between">
                                                                    <span className="text-xs font-semibold text-text-secondary">{f.label}</span>
                                                                    <span className="text-xs font-bold text-text-primary">
                                                                        {f.val || "—"} {f.unit}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recommendations UI */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4">
                                                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <Stethoscope className="w-4 h-4 text-indigo-500" />
                                                            Doctor & Medical Protocol
                                                        </h4>
                                                        <ul className="text-xs text-indigo-700/80 space-y-2 leading-relaxed">
                                                            {predictionResult === "Positive" ? (
                                                                <>
                                                                    <li><strong className="text-indigo-900">1. Urgent Consult:</strong> Book an immediate session with a certified Nephrologist.</li>
                                                                    <li><strong className="text-indigo-900">2. Confirmatory Tests:</strong> Repeat Serum Creatinine and eGFR to solidify baseline within 7 days.</li>
                                                                    <li><strong className="text-indigo-900">3. Complications Check:</strong> Manage associated conditions like BP and glucose rigidly. Ask doctor about ACE inhibitors appropriately.</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li><strong className="text-indigo-900">1. Annual Monitoring:</strong> Perform routine yearly kidney profile panels.</li>
                                                                    <li><strong className="text-indigo-900">2. General Checkup:</strong> No urgent consultation required. Review at your next standard evaluation.</li>
                                                                    <li><strong className="text-indigo-900">3. Medications:</strong> Use careful evaluation over OTC pain meds (NSAIDs) long-term.</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    
                                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                                                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <Activity className="w-4 h-4 text-emerald-500" />
                                                            Home & Lifestyle Recommendations
                                                        </h4>
                                                        <ul className="text-xs text-emerald-700/80 space-y-2 leading-relaxed">
                                                            {predictionResult === "Positive" ? (
                                                                <>
                                                                    <li><strong className="text-emerald-900">1. Diet Adjustments:</strong> Transition rapidly to a Low-Sodium, Low-Potassium diet.</li>
                                                                    <li><strong className="text-emerald-900">2. Fluid Balance:</strong> Consult your physician; restricted hydration protocols might apply in later stages.</li>
                                                                    <li><strong className="text-emerald-900">3. Harm Avoidance:</strong> Strictly avoid unverified herbal remedies which act as nephrotoxins.</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li><strong className="text-emerald-900">1. Healthy Lifestyle:</strong> 150 mins cardio exercise weekly.</li>
                                                                    <li><strong className="text-emerald-900">2. Optimal Hydration:</strong> Drink 2.5 - 3 Liters of clear water per day steadily.</li>
                                                                    <li><strong className="text-emerald-900">3. Dietary Balance:</strong> Consume a robust whole foods approach, minimizing highly processed sodium bombs.</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Disclaimer */}
                                                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                                        This report is generated by KidneyNet AI (Accuracy: 97.5%) and is intended for clinical decision support only.
                                                        It does not constitute a definitive medical diagnosis. Always consult a qualified nephrologist before making
                                                        any treatment decisions.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* ══ ACTION BUTTONS ══ */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex flex-wrap gap-4 justify-center"
                                        >
                                            <button
                                                onClick={resetPrediction}
                                                className="px-6 py-3 rounded-xl border border-border-light bg-white text-text-secondary font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                            >
                                                Run New Test
                                            </button>
                                                <button
                                                    onClick={() => downloadPDFReport(formData, predictionResult, riskScore, confidence)}
                                                    className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-black shadow-xl shadow-slate-900/30 hover:shadow-slate-900/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    Download PDF Report
                                                </button>
                                            </motion.div>

                                            {/* ══ FEEDBACK UI ══ */}
                                            {predictionId && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 15 }} 
                                                    animate={{ opacity: 1, y: 0 }} 
                                                    transition={{ delay: 0.7 }}
                                                    className="w-full max-w-lg mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center mx-auto shadow-sm"
                                                >
                                                    {feedbackSubmitted ? (
                                                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                                                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                                            </div>
                                                            <h4 className="font-bold text-text-primary">Thank you for your feedback!</h4>
                                                            <p className="text-xs text-text-muted mt-1">This actively helps improve our continuous learning MLOps AI model pipeline.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <h4 className="font-black text-text-primary tracking-tight mb-1">Help Improve MediIntel AI</h4>
                                                            <p className="text-xs text-text-muted mb-4">Did the doctor confirm this diagnosis as accurate for this patient?</p>
                                                            <div className="flex justify-center gap-3">
                                                                <button 
                                                                    onClick={() => submitFeedback(true)}
                                                                    className="flex-1 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    Yes, Correct
                                                                </button>
                                                                <button 
                                                                    onClick={() => submitFeedback(false)}
                                                                    className="flex-1 py-2.5 rounded-xl border-2 border-rose-500 text-rose-600 font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    No, Incorrect
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}

                                        </div>
                                ) : null}
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
