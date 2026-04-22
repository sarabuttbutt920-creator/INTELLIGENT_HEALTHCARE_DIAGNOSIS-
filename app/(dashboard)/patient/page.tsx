"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Calendar,
    Clock,
    ArrowRight,
    Droplets,
    Zap,
    Heart,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    FileText,
    Check,
    Brain,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    Stethoscope,
    Target
} from "lucide-react";
import Link from "next/link";
import { format, getHours } from "date-fns";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
} as const;

function getGreeting() {
    const h = getHours(new Date());
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-white">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black">{payload[0].value}<span className="text-sm text-slate-400 font-normal"> / 100</span></p>
            </div>
        );
    }
    return null;
};

export default function PatientOverview() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchProfile = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch('/api/patient/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("Dashboard fetch err:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        const interval = setInterval(() => fetchProfile(), 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-text-muted">Loading your health dashboard...</p>
                </div>
            </div>
        );
    }

    const latestEncounter = profile?.encounters?.[0];
    const latestLab = latestEncounter?.labResult;
    const latestPred = latestEncounter?.predictions?.[0];
    const nextAppointment = profile?.appointments?.[0];

    const healthScore = latestPred
        ? Math.max(10, Math.round(100 - (latestPred.risk_score * 100)))
        : 96;

    // Build trend chart from encounters
    const chartData = (profile?.encounters || [])
        .slice(0, 7)
        .reverse()
        .map((enc: any, i: number) => {
            const p = enc.predictions?.[0];
            const score = p ? Math.max(10, Math.round(100 - (p.risk_score * 100))) : 80;
            return {
                name: format(new Date(enc.encounter_date), "MMM d"),
                score
            };
        });

    if (chartData.length === 0) {
        chartData.push(
            { name: "Jan", score: 88 },
            { name: "Feb", score: 84 },
            { name: "Mar", score: 91 },
            { name: "Apr", score: healthScore }
        );
    }

    const healthMetrics = [
        {
            label: "Albumin",
            value: latestLab?.albumin != null ? `${latestLab.albumin} g/dL` : "—",
            icon: Droplets,
            color: "blue",
            normal: latestLab?.albumin ? (latestLab.albumin >= 3.5 && latestLab.albumin <= 5.0) : null
        },
        {
            label: "Hemoglobin",
            value: latestLab?.hemoglobin != null ? `${latestLab.hemoglobin} g/dL` : "—",
            icon: Zap,
            color: "purple",
            normal: latestLab?.hemoglobin ? (latestLab.hemoglobin >= 12 && latestLab.hemoglobin <= 17) : null
        },
        {
            label: "Creatinine",
            value: latestLab?.serum_creatinine != null ? `${latestLab.serum_creatinine} mg/dL` : "—",
            icon: Activity,
            color: "emerald",
            normal: latestLab?.serum_creatinine ? (latestLab.serum_creatinine <= 1.2) : null
        },
        {
            label: "Risk Score",
            value: latestPred ? `${(latestPred.risk_score * 100).toFixed(1)}%` : "—",
            icon: Heart,
            color: "sky",
            normal: latestPred ? latestPred.predicted_label !== 'CKD' : null
        },
    ];

    const recentTests = (profile?.encounters || []).slice(0, 4).map((enc: any) => {
        const p = enc.predictions?.[0];
        return {
            id: `ENC-${enc.encounter_id}`,
            title: p ? (p.predicted_label === 'CKD' ? "CKD AI Assessment" : "Negative AI Check") : "General Lab Result",
            date: format(new Date(enc.encounter_date), "MMM dd, yyyy"),
            status: p?.predicted_label === 'CKD' ? "Warning" : "Normal",
            risk: p?.predicted_label === 'CKD' ? "High" : "Low"
        };
    });

    const isCKD = latestPred?.predicted_label === 'CKD';

    return (
        <div className="space-y-8 pb-8">

            {/* Header */}
            <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-text-muted mb-1">{getGreeting()},</p>
                    <h1 className="text-3xl font-black tracking-tight text-text-primary">
                        {profile?.user?.full_name?.split(' ')[0] || "Patient"} <span className="wave">👋</span>
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">Here is your kidney health dashboard for {format(new Date(), "MMMM d, yyyy")}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchProfile(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border-light text-sm font-semibold text-text-secondary hover:text-primary transition-colors shadow-sm ${refreshing ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <Link href="/patient/prediction">
                        <button className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            New Analysis
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Main Hero Row */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Health Score Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className="lg:col-span-2 relative overflow-hidden rounded-4xl gradient-dark p-8 text-white min-h-70 flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest inline-block mb-4">
                                AI Early Detection Score
                            </span>
                            <div className="flex items-end gap-4">
                                <h2 className="text-7xl font-black tabular-nums">{healthScore}</h2>
                                <div className="mb-2">
                                    <p className="text-slate-400 text-sm">/100</p>
                                    {latestPred && (
                                        <div className={`mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isCKD ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                            {isCKD ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                            {isCKD ? 'CKD Risk Detected' : 'No CKD Detected'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="mt-3 text-slate-400 max-w-xs text-sm leading-relaxed">
                                {isCKD
                                    ? "Your risk markers are elevated. Please follow up with your nephrologist."
                                    : "Your kidney health indicators are within a healthy range. Keep maintaining your current plan."}
                            </p>
                        </div>

                        <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <ShieldCheck className="w-4 h-4" /> HIPAA Secured
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">Last synced: {format(lastUpdated, "h:mm a")}</p>
                        </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="relative z-10 flex flex-wrap gap-3 mt-6">
                        {healthMetrics.map((m) => (
                            <div key={m.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className={`w-8 h-8 rounded-lg bg-${m.color}-500/20 flex items-center justify-center`}>
                                    <m.icon className={`w-4 h-4 text-${m.color}-400`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</p>
                                    <p className="text-sm font-bold flex items-center gap-1.5">
                                        {m.value}
                                        {m.normal !== null && (
                                            <span className={m.normal ? 'text-emerald-400' : 'text-rose-400'}>
                                                {m.normal ? '✓' : '!'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Next Appointment */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-4xl border border-border-light p-6 shadow-sm flex flex-col"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" /> Next Visit
                        </h3>
                        <Link href="/patient/appointments" className="text-xs font-bold text-primary hover:underline">
                            View All
                        </Link>
                    </div>

                    {nextAppointment ? (
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-black text-text-primary text-sm">Dr. {nextAppointment.doctor?.user?.full_name?.split(' ')[0] || 'Specialist'}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{nextAppointment.doctor?.specialization || 'Consultant'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold">{format(new Date(nextAppointment.scheduled_start), "EEEE, MMM d")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold">{format(new Date(nextAppointment.scheduled_start), "hh:mm a")}</span>
                                </div>
                            </div>

                            <Link href="/patient/appointments">
                                <button className="mt-5 w-full py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                                    View Details <ChevronRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-3 border border-dashed border-slate-200">
                                <Calendar className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-text-primary mb-1">No upcoming visits</p>
                            <p className="text-xs text-text-muted max-w-45 leading-relaxed">Schedule a consultation with your nephrologist.</p>
                            <Link href="/patient/book">
                                <button className="mt-4 px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-primary/20">
                                    Book Appointment
                                </button>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Chart + Stats Row */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Health Score Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm p-6 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-text-primary">Health Score Trend</h3>
                            <p className="text-xs text-text-muted mt-0.5">AI detection score across your visits</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            <TrendingUp className="w-3.5 h-3.5" /> Live Data
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#6C3CE1"
                                strokeWidth={2.5}
                                fill="url(#healthGrad)"
                                dot={{ fill: '#6C3CE1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, stroke: '#6C3CE1', strokeWidth: 2, fill: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl border border-border-light shadow-sm p-6 flex flex-col gap-3"
                >
                    <h3 className="font-bold text-text-primary mb-2">Quick Actions</h3>
                    {[
                        { href: "/patient/prediction", label: "Run AI Analysis", icon: Brain, color: "primary", desc: "Submit new lab results" },
                        { href: "/patient/reports", label: "View My Reports", icon: FileText, color: "blue", desc: "Access medical records" },
                        { href: "/patient/chat", label: "Message Doctor", icon: Stethoscope, color: "emerald", desc: "Secure chat channel" },
                        { href: "/patient/history", label: "Clinical History", icon: Activity, color: "purple", desc: "Past diagnoses & labs" },
                    ].map((action, i) => (
                        <Link key={action.href} href={action.href}>
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-all cursor-pointer group"
                            >
                                <div className={`w-9 h-9 rounded-lg bg-${action.color === 'primary' ? 'primary' : action.color + '-50'} ${action.color === 'primary' ? 'text-white' : `text-${action.color}-600`} flex items-center justify-center shrink-0`}>
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-primary">{action.label}</p>
                                    <p className="text-[10px] text-text-muted">{action.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </div>

            {/* Recent Tests + Daily Goals */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Recent Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-border-light flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">Recent AI Assessments</h3>
                        <Link href="/patient/reports" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                            Full History <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="p-3">
                        <AnimatePresence>
                            {recentTests.length === 0 ? (
                                <div className="p-8 text-center text-text-muted font-medium">
                                    No assessments yet. Submit a lab report to get started.
                                </div>
                            ) : (
                                recentTests.map((test: any, i: number) => (
                                    <motion.div
                                        key={test.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${test.status === "Normal" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                                {test.status === "Normal"
                                                    ? <ShieldCheck className="w-5 h-5" />
                                                    : <AlertTriangle className="w-5 h-5" />
                                                }
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-text-primary">{test.title}</h4>
                                                <p className="text-xs text-text-muted font-medium mt-0.5">{test.date} • {test.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Risk</p>
                                                <p className={`text-xs font-black ${test.risk === "Low" ? "text-emerald-500" : "text-amber-500"}`}>{test.risk}</p>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${test.status === "Normal" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                                                {test.status}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Daily Health Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl border border-border-light shadow-sm p-6"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <Target className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-text-primary">Daily Health Goals</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { title: "Drink 3L of Water", status: "Completed", isDone: true, color: "blue" },
                            { title: "Low Protein Intake", status: "Ongoing", isDone: false, color: "purple" },
                            { title: "Evening Walk (30 min)", status: "Scheduled", isDone: false, color: "emerald" },
                            { title: "Check Glucose Level", status: "Upcoming", isDone: false, color: "amber" },
                        ].map((goal, i) => (
                            <motion.div
                                key={goal.title}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.05 }}
                                className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${goal.isDone ? "bg-primary/5 border-primary/15" : "bg-surface border-border-light border-dashed hover:border-solid hover:bg-white"}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${goal.isDone ? "bg-primary border-primary" : "border-slate-300"}`}>
                                    {goal.isDone && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${goal.isDone ? "text-text-muted line-through" : "text-text-primary"}`}>{goal.title}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${goal.isDone ? "text-primary" : "text-text-muted"}`}>{goal.status}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border-light">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-text-muted">Daily Progress</p>
                            <p className="text-xs font-black text-primary">1 / 4</p>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "25%" }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                className="h-full gradient-primary rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
