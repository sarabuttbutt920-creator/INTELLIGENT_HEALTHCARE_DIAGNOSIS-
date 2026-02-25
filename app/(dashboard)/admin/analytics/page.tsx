"use client";

import { motion } from "framer-motion";
import {
    Activity,
    Users,
    BrainCircuit,
    Server,
    Download,
    TrendingUp,
    HeartPulse,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    Stethoscope
} from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

// --- Mock Data ---

// 1. User Growth Over Last 6 Months
const userGrowthData = [
    { month: "Sep", patients: 120, doctors: 15, total: 135 },
    { month: "Oct", patients: 250, doctors: 25, total: 275 },
    { month: "Nov", patients: 400, doctors: 45, total: 445 },
    { month: "Dec", patients: 650, doctors: 70, total: 720 },
    { month: "Jan", patients: 950, doctors: 110, total: 1060 },
    { month: "Feb", patients: 1400, doctors: 145, total: 1545 },
];

// 2. AI Model Inferences & Predicitons Activity (Last 7 Days)
const aiActivityData = [
    { day: "Mon", inference: 150, riskFlags: 20 },
    { day: "Tue", inference: 230, riskFlags: 45 },
    { day: "Wed", inference: 210, riskFlags: 30 },
    { day: "Thu", inference: 350, riskFlags: 60 },
    { day: "Fri", inference: 420, riskFlags: 90 },
    { day: "Sat", inference: 180, riskFlags: 15 },
    { day: "Sun", inference: 200, riskFlags: 12 },
];

// 3. Clinical Demographics / User Base Make-up
const roleDistributionData = [
    { name: "Patients", value: 1400 },
    { name: "Doctors", value: 145 },
    { name: "Admins", value: 3 },
];
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6"]; // Blue, Emerald, Purple

// 4. Server Uptime & Latency Metrics
const systemPerformanceData = [
    { time: "00:00", latency: 45 },
    { time: "04:00", latency: 42 },
    { time: "08:00", latency: 85 },
    { time: "12:00", latency: 120 },
    { time: "16:00", latency: 105 },
    { time: "20:00", latency: 65 },
    { time: "23:59", latency: 48 },
];

// --- Custom Tooltips ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-border-light p-3 rounded-xl shadow-xl">
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

export default function AnalyticsDashboardPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">System Analytics</h1>
                    <p className="text-text-muted mt-1">Real-time platform insights, ML metrics, and server health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Top Stat KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Platform Users */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm card-hover relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <ArrowUpRight className="w-3 h-3" /> 16.2%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Total Registered Users</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-1">1,548</h3>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                </motion.div>

                {/* AI Inferences */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm card-hover relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50">
                            <BrainCircuit className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <ArrowUpRight className="w-3 h-3" /> 42.5%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Total AI Inferences</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-1">18.4K</h3>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                </motion.div>

                {/* CKD Detections */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm card-hover relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50">
                            <HeartPulse className="w-6 h-6 text-rose-500" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                            <TrendingUp className="w-3 h-3" /> 5.8%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-muted">High-Risk Cases Detected</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-1">1,240</h3>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                </motion.div>

                {/* Uptime */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm card-hover relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
                            <Server className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <ShieldCheck className="w-3 h-3" /> SLA
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Server Uptime & App Health</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-1">99.99%</h3>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                </motion.div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* User Growth (Line Chart) */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">System Growth Index</h2>
                            <p className="text-sm text-text-muted">Monthly user accumulation across roles.</p>
                        </div>
                        <div className="p-2 bg-blue-50/50 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} name="Total Users" />
                                <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} name="Patients" />
                                <Line type="monotone" dataKey="doctors" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} name="Doctors" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Role Demographics (Pie Chart) */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">User Demographics</h2>
                            <p className="text-sm text-text-muted">Platform composition.</p>
                        </div>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {roleDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-light flex justify-between items-center text-sm">
                        <span className="text-text-muted">Total Composition</span>
                        <span className="font-bold text-text-primary">100%</span>
                    </div>
                </motion.div>

            </div>

            {/* Bottom Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* AI Inference Activity (Bar Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">AI Inference Load</h2>
                            <p className="text-sm text-text-muted">Predictions processed per day vs detected risk cases.</p>
                        </div>
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                            <Stethoscope className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aiActivityData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                                <Bar dataKey="inference" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} name="Total Scans" barSize={30} />
                                <Bar dataKey="riskFlags" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} name="High Risk Flags" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* System Latency (Area Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">API Latency </h2>
                            <p className="text-sm text-text-muted">Millisecond response times over 24H window.</p>
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
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" name="Latency (ms)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
