"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle,
    BrainCircuit,
    Calendar,
    Stethoscope,
    RefreshCw,
    TrendingUp,
    ShieldCheck,
    HeartPulse,
    MoreHorizontal,
    FileText,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { format, getHours } from "date-fns";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

function getGreeting() {
    const h = getHours(new Date());
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-white">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                        <span className="text-slate-300">{entry.name}:</span>
                        <span className="font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const labelStyles = {
    CKD: "bg-rose-100 text-rose-700",
    NOT_CKD: "bg-emerald-100 text-emerald-700",
    UNKNOWN: "bg-amber-100 text-amber-700"
};

export default function AdminOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-text-muted">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const s = stats?.stats || {};
    const weeklyData = stats?.weeklyData || [];
    const recentPredictions = stats?.recentPredictions || [];

    const kpiCards = [
        { label: "Total Patients", value: s.totalPatients ?? 0, change: "+12.5%", isUp: true, icon: Users, color: "blue", link: "/admin/patients" },
        { label: "AI Predictions", value: s.totalPredictions ?? 0, change: "+18.2%", isUp: true, icon: BrainCircuit, color: "purple", link: "/admin/predictions" },
        { label: "CKD Detected", value: s.ckdCount ?? 0, change: "-3.1%", isUp: false, icon: AlertCircle, color: "rose", link: "/admin/predictions" },
        { label: "Active Doctors", value: s.totalDoctors ?? 0, change: "+5.0%", isUp: true, icon: Stethoscope, color: "emerald", link: "/admin/doctors" },
    ];

    return (
        <div className="space-y-8 pb-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-text-muted mb-1">{getGreeting()}, Admin</p>
                    <h1 className="text-3xl font-black tracking-tight text-text-primary">Control Center</h1>
                    <p className="text-text-secondary text-sm mt-1">Platform overview — {format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStats(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border-light text-sm font-semibold text-text-secondary hover:text-primary shadow-sm transition-all ${refreshing ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Syncing...' : 'Refresh'}
                    </button>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" /> Live
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
                    >
                        <Link href={card.link}>
                            <div className={`bg-white p-6 rounded-2xl border border-border-light shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group relative overflow-hidden`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${card.color}-500/5 rounded-full group-hover:bg-${card.color}-500/10 transition-colors`} />
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl bg-${card.color}-50 text-${card.color}-600`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${card.isUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"} px-2 py-1 rounded-lg`}>
                                        {card.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {card.change}
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-text-primary mb-1 tabular-nums">{card.value.toLocaleString()}</p>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{card.label}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Weekly Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-text-primary">AI Prediction Activity</h3>
                            <p className="text-xs text-text-muted mt-0.5">Daily predictions & CKD flags — last 7 days</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-text-muted">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Predictions</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> CKD Flags</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                            <defs>
                                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6C3CE1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                                <linearGradient id="ckdGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f43f5e" />
                                    <stop offset="100%" stopColor="#fb7185" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="predictions" fill="url(#predGrad)" radius={[6, 6, 0, 0]} name="Predictions" maxBarSize={36} />
                            <Bar dataKey="ckdFlags" fill="url(#ckdGrad)" radius={[6, 6, 0, 0]} name="CKD Flags" maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Right Sidebar */}
                <div className="space-y-5">

                    {/* Platform Health */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-[#0F172A] p-6 rounded-3xl text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                        <h3 className="text-base font-bold mb-1">Platform Health</h3>
                        <p className="text-xs text-slate-400 mb-5">System performance metrics</p>

                        <div className="space-y-4">
                            {[
                                { label: "Model Accuracy", val: 98.2, color: "bg-primary" },
                                { label: "Daily Goal", val: s.totalPredictions > 0 ? Math.min(100, Math.round((s.totalPredictions / 100) * 100)) : 84, color: "bg-emerald-400" },
                                { label: "CKD Detection Rate", val: s.totalPredictions > 0 ? Math.round((s.ckdCount / s.totalPredictions) * 100) : 15, color: "bg-rose-400" },
                            ].map(item => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white">{item.val.toFixed(item.label === "Model Accuracy" ? 1 : 0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                            className={`h-full ${item.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/10">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Today's Appts</p>
                                <p className="text-xl font-black">{s.todayAppointments ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Pending</p>
                                <p className="text-xl font-black text-amber-400">{s.pendingAppointments ?? 0}</p>
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-600 mt-4 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Synced: {format(lastUpdated, "h:mm a")}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl border border-border-light shadow-sm p-5"
                    >
                        <h3 className="font-bold text-text-primary mb-4">Quick Navigation</h3>
                        <div className="space-y-2">
                            {[
                                { label: "Manage Patients", href: "/admin/patients", icon: Users, color: "blue" },
                                { label: "Appointments", href: "/admin/appointments", icon: Calendar, color: "emerald" },
                                { label: "AI Reports", href: "/admin/reports", icon: FileText, color: "purple" },
                                { label: "Visitor Logs", href: "/admin/logs", icon: Activity, color: "amber" },
                            ].map(link => (
                                <Link key={link.href} href={link.href}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-all cursor-pointer group">
                                        <div className={`w-8 h-8 rounded-lg bg-${link.color}-50 text-${link.color}-600 flex items-center justify-center shrink-0`}>
                                            <link.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-text-primary">{link.label}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent Predictions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden"
            >
                <div className="p-6 border-b border-border-light flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-text-primary">Recent AI Diagnoses</h3>
                        <p className="text-xs text-text-muted mt-0.5">Latest prediction outputs from the system</p>
                    </div>
                    <Link href="/admin/predictions">
                        <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                            View All <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50">
                                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Model</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">AI Result</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Risk Score</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            <AnimatePresence>
                                {recentPredictions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                                            <BrainCircuit className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No predictions yet.</p>
                                        </td>
                                    </tr>
                                ) : recentPredictions.map((pred: any, i: number) => (
                                    <motion.tr
                                        key={pred.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-surface/40 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-xs font-black text-white uppercase shadow-sm">
                                                    {pred.avatar}
                                                </div>
                                                <span className="text-sm font-semibold text-text-primary">{pred.patient}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-text-secondary bg-surface px-2 py-1 rounded-lg border border-border-light">{pred.modelName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${labelStyles[pred.predictedLabel as keyof typeof labelStyles] || "bg-slate-100 text-slate-700"}`}>
                                                {pred.predictedLabel?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${pred.riskScore >= 0.7 ? 'bg-rose-500' : pred.riskScore >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${pred.riskScore * 100}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-bold ${pred.riskScore >= 0.7 ? 'text-rose-600' : pred.riskScore >= 0.4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {(pred.riskScore * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(pred.createdAt), "MMM d, h:mm a")}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>
    );
}
