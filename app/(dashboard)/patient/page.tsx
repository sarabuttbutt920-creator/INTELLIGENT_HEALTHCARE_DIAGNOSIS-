"use client";

import { motion } from "framer-motion";
import {
    Activity,
    Calendar,
    Clock,
    ArrowRight,
    Droplets,
    Zap,
    Heart,
    ChevronRight,
    Search,
    Download
} from "lucide-react";
import Image from "next/image";

/* Mock Data */
const healthMetrics = [
    { label: "Albumin", value: "Level 1", status: "Normal", color: "blue", icon: Droplets },
    { label: "Blood Pressure", value: "120/80", status: "Ideal", color: "emerald", icon: Activity },
    { label: "Hemoglobin", value: "14.2 g/dL", status: "Normal", color: "purple", icon: Zap },
    { label: "Risk Factor", value: "8.4%", status: "Low Risk", color: "sky", icon: Heart },
];

const testHistory = [
    {
        id: "LAB-882",
        title: "Full Kidney Panel",
        date: "Feb 18, 2026",
        status: "Normal",
        risk: "Low"
    },
    {
        id: "LAB-841",
        title: "Serum Creatinine Test",
        date: "Jan 24, 2026",
        status: "Warning",
        risk: "Moderate"
    },
    {
        id: "LAB-792",
        title: "Glomerular Filtration Rate",
        date: "Dec 12, 2025",
        status: "Normal",
        risk: "Low"
    },
];

export default function PatientOverview() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Hello, Welcome Back 👋</h1>
                    <p className="text-text-secondary text-sm">Here is your kidney health summary for today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-border-light text-sm font-semibold text-text-primary hover:bg-surface transition-colors">
                        <Calendar className="w-4 h-4 text-primary" />
                        Schedule Visit
                    </button>
                    <button className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                        New Analysis
                    </button>
                </div>
            </div>

            {/* Health Score Card */}
            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 relative overflow-hidden rounded-[32px] gradient-dark p-8 text-white min-h-[300px] flex flex-col justify-between"
                >
                    {/* Background Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                            Early Detection Score
                        </span>
                        <div className="mt-6 flex items-end gap-4">
                            <h2 className="text-6xl font-bold">92<span className="text-2xl text-slate-400 font-medium">/100</span></h2>
                            <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                                <ArrowRight className="w-3 h-3 -rotate-45" />
                                +2.4% from last month
                            </div>
                        </div>
                        <p className="mt-4 text-slate-300 max-w-sm leading-relaxed text-sm">
                            Your kidney health score is excellent. Keep following your current diet and hydration plan to maintain this status.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-4 mt-8">
                        {healthMetrics.map((metric) => (
                            <div key={metric.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className={`w-8 h-8 rounded-lg bg-${metric.color}-500/20 flex items-center justify-center`}>
                                    <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{metric.label}</p>
                                    <p className="text-sm font-bold">{metric.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Next Appointment Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[32px] border border-border-light p-6 shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-text-primary">Next Consultation</h3>
                            <button className="text-text-muted hover:text-primary transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-light mb-6">
                            <div className="w-14 h-14 rounded-xl overflow-hidden relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
                                    alt="Doctor"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary text-sm">Dr. Sarah Mitchell</h4>
                                <p className="text-xs text-primary font-semibold">Kidney Specialist</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-text-secondary">
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Monday, Feb 28, 2026</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-secondary">
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">10:30 AM - 11:30 AM</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                        Get Preparation Guideline
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>

            {/* Recent Analysis Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-border-light shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-light flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">Medical History</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">See full history</button>
                    </div>
                    <div className="p-2">
                        {testHistory.map((test, i) => (
                            <div key={test.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${test.status === "Normal" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-text-primary">{test.title}</h4>
                                        <p className="text-xs text-text-muted font-medium">{test.date} • ID: {test.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Risk Level</p>
                                        <p className={`text-xs font-bold ${test.risk === "Low" ? "text-emerald-500" : "text-amber-500"}`}>{test.risk}</p>
                                    </div>
                                    <button className="p-2 rounded-lg bg-surface text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Health Reminder List */}
                <div className="bg-white rounded-[32px] border border-border-light p-6 shadow-sm">
                    <h3 className="font-bold text-text-primary mb-6">Daily Health Goals</h3>
                    <div className="space-y-4">
                        {[
                            { title: "Drink 3L of Water", status: "Completed", isDone: true, color: "blue" },
                            { title: "Low Protein Intake", status: "Ongoing", isDone: false, color: "purple" },
                            { title: "Evening Walk", status: "Scheduled", isDone: false, color: "emerald" },
                            { title: "Check Glucose", status: "Upcoming", isDone: false, color: "amber" },
                        ].map((goal, i) => (
                            <div key={goal.title} className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-border-light border-dashed transition-all hover:border-solid hover:bg-white hover:border-border-light hover:shadow-sm">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${goal.isDone ? "bg-primary border-primary text-white" : "border-border-light"
                                    }`}>
                                    {goal.isDone && <Check className="w-3 h-3" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${goal.isDone ? "text-text-muted line-through" : "text-text-primary"}`}>{goal.title}</p>
                                    <p className="text-[10px] text-text-muted font-semibold uppercase">{goal.status}</p>
                                </div>
                                <Activity className={`w-4 h-4 text-${goal.color}-500 opacity-20`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    );
}

function Check(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
