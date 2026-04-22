"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Activity, Users, BrainCircuit, Server, Download, TrendingUp, HeartPulse,
    Calendar, ArrowUpRight, ShieldCheck, Stethoscope, RefreshCcw, Loader2,
    FileText, CalendarDays
} from "lucide-react";
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];

const aiActivityData = [
    { day: "Mon", inference: 150, riskFlags: 20 },
    { day: "Tue", inference: 230, riskFlags: 45 },
    { day: "Wed", inference: 210, riskFlags: 30 },
    { day: "Thu", inference: 350, riskFlags: 60 },
    { day: "Fri", inference: 420, riskFlags: 90 },
    { day: "Sat", inference: 180, riskFlags: 15 },
    { day: "Sun", inference: 200, riskFlags: 12 },
];

const systemPerformanceData = [
    { time: "00:00", latency: 45 },
    { time: "04:00", latency: 42 },
    { time: "08:00", latency: 85 },
    { time: "12:00", latency: 120 },
    { time: "16:00", latency: 105 },
    { time: "20:00", latency: 65 },
    { time: "23:59", latency: 48 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md border border-border-light p-3 rounded-xl shadow-xl">
                <p className="font-bold text-text-primary mb-2 text-sm">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-text-secondary capitalize">{entry.name}:</span>
                        <span className="text-sm font-bold text-text-primary">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface AdminStats {
    totalPatients: number;
    totalDoctors: number;
    totalPredictions: number;
    ckdCount: number;
    totalReports: number;
    todayAppointments: number;
    avgRiskScore: number;
}

interface WeeklyDataPoint {
    day: string;
    predictions: number;
    ckdFlags: number;
}

export default function AnalyticsDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setWeeklyData(data.weeklyData || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const roleDistributionData = stats ? [
        { name: "Patients", value: stats.totalPatients },
        { name: "Doctors", value: stats.totalDoctors },
        { name: "Admins", value: 1 },
    ] : [];

    const growthData = weeklyData.length > 0 ? weeklyData.map(d => ({
        month: d.day, predictions: d.predictions, ckdFlags: d.ckdFlags
    })) : aiActivityData.map(d => ({ month: d.day, predictions: d.inference, ckdFlags: d.riskFlags }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">System Analytics</h1>
                    <p className="text-text-muted mt-1">Real-time platform insights, ML metrics, and server health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Patients", value: stats?.totalPatients, icon: Users, color: "text-blue-500", bg: "bg-blue-50", glow: "bg-blue-500/5", badge: "Platform" },
                    { label: "AI Predictions", value: stats?.totalPredictions, icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50", glow: "bg-purple-500/5", badge: "Total" },
                    { label: "CKD Cases Detected", value: stats?.ckdCount, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50", glow: "bg-rose-500/5", badge: "High Risk" },
                    { label: "Server Uptime", value: "99.99%", icon: Server, color: "text-emerald-500", bg: "bg-emerald-50", glow: "bg-emerald-500/5", badge: "SLA" },
                ].map((stat, idx) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm card-hover relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                <ArrowUpRight className="w-3 h-3" />{stat.badge}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-text-primary mt-1">
                            {loading ? <span className="text-text-muted text-xl">—</span> : (stat.value ?? "—")}
                        </h3>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.glow} rounded-full blur-2xl pointer-events-none`} />
                    </motion.div>
                ))}
            </div>

            {/* Secondary stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Active Doctors", value: stats?.totalDoctors, icon: Stethoscope, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Today's Appointments", value: stats?.todayAppointments, icon: CalendarDays, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Medical Reports", value: stats?.totalReports, icon: FileText, color: "text-teal-500", bg: "bg-teal-50" },
                ].map((stat, idx) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + idx * 0.07 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{loading ? "—" : (stat.value ?? "—")}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Predictions */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Weekly AI Activity</h2>
                            <p className="text-sm text-text-muted">Predictions processed vs CKD flags raised (last 7 days).</p>
                        </div>
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                            <BrainCircuit className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradPredictions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="gradCKD" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="circle" />
                                <Bar dataKey="predictions" fill="url(#gradPredictions)" radius={[4, 4, 0, 0]} name="Total Predictions" barSize={20} />
                                <Bar dataKey="ckdFlags" fill="url(#gradCKD)" radius={[4, 4, 0, 0]} name="CKD Flags" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* User Demographics */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">User Demographics</h2>
                            <p className="text-sm text-text-muted">Platform composition.</p>
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-text-muted">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={roleDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {roleDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-border-light space-y-2">
                        {roleDistributionData.map((item, idx) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                                    <span className="text-text-secondary">{item.name}</span>
                                </div>
                                <span className="font-bold text-text-primary">{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Inference Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Simulated AI Load</h2>
                            <p className="text-sm text-text-muted">Estimated daily inference & risk pattern.</p>
                        </div>
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aiActivityData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="circle" />
                                <Bar dataKey="inference" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} name="Inferences" barSize={28} />
                                <Bar dataKey="riskFlags" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Risk Flags" barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* System Latency */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    className="bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">API Response Latency</h2>
                            <p className="text-sm text-text-muted">Millisecond response times — 24H window.</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full border border-emerald-100 flex items-center gap-1.5 w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Systems Optimal
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={systemPerformanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" name="Latency (ms)" activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Platform Health Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold">Platform Health Monitor</h2>
                        <p className="text-slate-400 text-sm mt-1">Real-time service status across system components.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />All Systems Operational
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Database Cluster", pct: 98, color: "bg-emerald-500" },
                        { label: "AI Model Server", pct: 94, color: "bg-blue-500" },
                        { label: "API Gateway", pct: 99, color: "bg-emerald-500" },
                        { label: "Storage Service", pct: 87, color: "bg-amber-500" },
                    ].map((item, idx) => (
                        <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + idx * 0.08 }}
                            className="bg-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                                <span className="text-sm font-bold text-white">{item.pct}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ delay: 1.1 + idx * 0.08, duration: 0.8, ease: "easeOut" }}
                                    className={`h-full rounded-full ${item.color}`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
