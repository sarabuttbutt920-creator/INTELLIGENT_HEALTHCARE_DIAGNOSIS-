"use client";

import { useState } from "react";
import { Activity, BrainCircuit, FileImage, ShieldCheck } from "lucide-react";
import CkdPrediction from "./CkdPrediction";
import KidneyCancerPrediction from "./KidneyCancerPrediction";

export default function PredictionPageRouter() {
    const [selectedModel, setSelectedModel] = useState<"SELECT" | "CKD" | "CANCER">("SELECT");

    if (selectedModel === "CKD") {
        return <CkdPrediction onBack={() => setSelectedModel("SELECT")} />;
    }

    if (selectedModel === "CANCER") {
        return <KidneyCancerPrediction onBack={() => setSelectedModel("SELECT")} />;
    }

    return (
        <div className="max-w-5xl mx-auto py-10 space-y-12">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                    <BrainCircuit className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">
                    AI Healthcare Diagnosis
                </h1>
                <p className="text-text-muted max-w-2xl mx-auto text-lg">
                    Select an AI model to begin your prediction. Our platform supports both tabular medical data analysis and deep-learning image classification.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                        <ShieldCheck className="w-4 h-4" /> HIPAA Compliant
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                        <Activity className="w-4 h-4" /> MediIntel Models
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <button
                    onClick={() => setSelectedModel("CKD")}
                    className="flex flex-col items-center p-8 bg-white border border-border-light rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Activity className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3">Chronic Kidney Disease (CKD)</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6">
                        Predict the risk of Chronic Kidney Disease using structured tabular data such as vital signs, kidney function tests, and blood profiles.
                    </p>
                    <span className="mt-auto px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        Predict using Patient Data →
                    </span>
                </button>
                
                <button
                    onClick={() => setSelectedModel("CANCER")}
                    className="flex flex-col items-center p-8 bg-white border border-border-light rounded-3xl hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 group text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FileImage className="w-12 h-12 text-rose-600" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3">Kidney Tumor Detection</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6">
                        Analyze medical scan images (MRI/X-Ray) using our deep learning visual classification model to detect kidney tumors.
                    </p>
                    <span className="mt-auto px-6 py-2.5 bg-rose-50 text-rose-700 font-bold rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        Predict using Scan Image →
                    </span>
                </button>
            </div>
        </div>
    );
}
