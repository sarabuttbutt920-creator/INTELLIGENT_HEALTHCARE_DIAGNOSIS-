"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { UploadCloud, ArrowLeft, BrainCircuit, AlertCircle, FileImage, ShieldCheck, CheckCircle2, ScanSearch, BadgeAlert, BadgeCheck, Zap } from "lucide-react";

export default function KidneyCancerPrediction({ onBack }: { onBack: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictionResult, setPredictionResult] = useState<"Tumor" | "Normal" | null>(null);
    const [confidence, setConfidence] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setPredictionResult(null);
        setError(null);
    };

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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, []);

    const handlePredict = async () => {
        if (!file) return;
        setIsSubmitting(true);
        setError(null);
        setPredictionResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch('/api/patient/kidney-cancer/predict', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setPredictionResult(data.result);
                setConfidence(data.confidence * 100);
            } else {
                setError(data.message || "Prediction failed. Please try again.");
            }
        } catch (e) {
            console.error("Prediction API Error", e);
            setError("Unable to reach the AI service. Please make sure the backend is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPredictionResult(null);
        setError(null);
        setConfidence(0);
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 mb-2"
            >
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Model Selection
                    </button>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <FileImage className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-text-primary">
                            Kidney Tumor Detection
                        </h1>
                    </div>
                    <p className="text-text-muted mt-1">
                        Upload an MRI or X-Ray scan image for deep learning AI inference.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>HIPAA Compliant</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-border-light shadow-sm p-6 md:p-8"
            >
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-rose-800">Prediction Error</h4>
                            <p className="text-sm text-rose-700">{error}</p>
                        </div>
                    </div>
                )}

                {!predictionResult && !isSubmitting ? (
                    <div className="space-y-6">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${isDragging
                                ? "border-rose-400 bg-rose-50"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".png,.jpg,.jpeg"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFileSelect(e.target.files[0]);
                                    }
                                }}
                            />
                            {previewUrl ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-48 h-48 rounded-xl overflow-hidden mb-4 border-4 border-white shadow-lg">
                                        <img src={previewUrl} alt="Scan Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-sm font-bold text-text-primary">{file?.name}</p>
                                    <p className="text-xs text-text-muted mt-1">Click or drag to change image</p>
                                </div>
                            ) : (
                                <motion.div animate={isDragging ? { scale: 1.05 } : { scale: 1 }} className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                                        <UploadCloud className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary mb-2">Upload Scan Image</h3>
                                    <p className="text-sm text-text-muted max-w-sm">
                                        Drag & drop your medical scan image here, or click to browse. Max size 16MB. Allowed formats: PNG, JPG, JPEG.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {file && (
                            <button
                                onClick={handlePredict}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-lg shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all"
                            >
                                <ScanSearch className="w-6 h-6" />
                                Run AI Analysis
                            </button>
                        )}
                    </div>
                ) : isSubmitting ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative w-28 h-28 mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-rose-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-text-primary mb-3">Analyzing Image...</h2>
                        <p className="text-text-secondary text-sm">
                            KidneyNet Deep Learning Model is processing the scan.
                        </p>
                    </div>
                ) : predictionResult ? (
                    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.7 }}
                            className={`w-full rounded-3xl p-8 mb-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl ${predictionResult === "Tumor"
                                    ? "bg-gradient-to-br from-rose-600 to-red-700 shadow-rose-300"
                                    : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-300"
                                }`}
                        >
                            <div className="w-32 h-32 rounded-2xl bg-white/20 p-2 shrink-0 border border-white/30">
                                {previewUrl && (
                                    <img src={previewUrl} alt="Analyzed Scan" className="w-full h-full object-cover rounded-xl" />
                                )}
                            </div>
                            <div className="text-left flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {predictionResult === "Tumor" ? <BadgeAlert className="w-6 h-6 text-white" /> : <BadgeCheck className="w-6 h-6 text-white" />}
                                    <p className="text-white/80 text-sm font-bold uppercase tracking-widest">Diagnosis Result</p>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 leading-none">
                                    {predictionResult === "Tumor" ? "Tumor Detected" : "Normal Kidney"}
                                </h2>
                                <p className="text-white/90 text-sm font-medium">
                                    {predictionResult === "Tumor"
                                        ? "The AI model has detected anomalies consistent with a kidney tumor."
                                        : "The AI model found no signs of tumor in the provided scan."}
                                </p>
                            </div>
                            <div className="text-center bg-black/20 rounded-2xl p-4 min-w-[120px] border border-white/20">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Confidence</p>
                                <p className="text-3xl font-black text-white">{confidence.toFixed(1)}%</p>
                            </div>
                        </motion.div>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={reset}
                                className="flex-1 px-6 py-3.5 rounded-xl border-2 border-border-light bg-white text-text-secondary font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Analyze Another Image
                            </button>
                        </div>
                    </div>
                ) : null}
            </motion.div>
        </div>
    );
}
