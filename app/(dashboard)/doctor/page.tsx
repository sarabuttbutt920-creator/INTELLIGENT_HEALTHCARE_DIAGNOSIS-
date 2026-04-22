"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Calendar, ClipboardList, TrendingUp,
    MessageSquare, MoreVertical, Clock, Star,
    AlertCircle, ChevronRight, Activity, Stethoscope,
    HeartPulse, CheckCircle2, XCircle, RefreshCw, BrainCircuit
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, Cell
} from "recharts";

interface Stats {
    totalPatients: number;
    todaysCount: number;
    reportsReviewed: number;
    avgRating: string;
    reviewCount: number;
}

interface TodayAppointment {
    id: string;
    patient: string;
    time: string;
    type: string;
    status: string;
    risk: string;
}

interface WeeklyData {
    day: string;
    patients: number;
    goal: number;
}

const statusColors: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-600",
    CONFIRMED: "bg-blue-50 text-blue-600",
    REQUESTED: "bg-amber-50 text-amber-600",
    CANCELLED: "bg-red-50 text-red-500",
};

const statusLabels: Record<string, string> = {
    COMPLETED: "Completed",
    CONFIRMED: "Confirmed",
    REQUESTED: "Pending",
    CANCELLED: "Cancelled",
};

const CustomBar = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!height || height <= 0) return null;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} rx={6} ry={6}
                fill="url(#barGrad)" opacity={0.9} />
        </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-border-light rounded-xl shadow-lg px-3 py-2 text-sm">
                <p className="font-bold text-text-primary">{label}</p>
                <p className="text-primary font-semibold">{payload[0].value} patients</p>
            </div>
        );
    }
    return null;
};

export default function DoctorOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [doctorName, setDoctorName] = useState("Doctor");

    const fetchData = async () => {
        try {
            const [statsRes, profileRes] = await Promise.all([
                fetch('/api/doctor/stats'),
                fetch('/api/doctor/profile')
            ]);
            const statsData = await statsRes.json();
            const profileData = await profileRes.json();

            if (statsData.success) {
                setStats(statsData.stats);
                setAppointments(statsData.todaysAppointments || []);
                setWeeklyData(statsData.weeklyData || []);
            }
            if (profileData.success) {
                setDoctorName(profileData.data.user.full_name);
            }
            setLastRefresh(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const statCards = stats ? [
        {
            label: "Total Patients",
            value: stats.totalPatients,
            suffix: "",
            change: "Active in your registry",
            icon: Users,
            color: "blue",
            gradient: "from-blue-500 to-blue-600",
            bg: "bg-blue-50",
            text: "text-blue-600",
        },
        {
            label: "Today's Appointments",
            value: stats.todaysCount,
            suffix: "",
            change: stats.todaysCount > 0 ? `${stats.todaysCount} scheduled today` : "None today",
            icon: Calendar,
            color: "purple",
            gradient: "from-purple-500 to-primary",
            bg: "bg-purple-50",
            text: "text-purple-600",
        },
        {
            label: "Reports This Week",
            value: stats.reportsReviewed,
            suffix: "",
            change: "Encounters reviewed",
            icon: ClipboardList,
            color: "emerald",
            gradient: "from-emerald-500 to-teal-500",
            bg: "bg-emerald-50",
            text: "text-emerald-600",
        },
        {
            label: "Average Rating",
            value: stats.avgRating,
            suffix: "/5",
            change: `From ${stats.reviewCount} patient reviews`,
            icon: Star,
            color: "amber",
            gradient: "from-amber-400 to-orange-500",
            bg: "bg-amber-50",
            text: "text-amber-600",
        },
    ] : [];

    const today = new Date();
    const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">
                        {greeting}, <span className="gradient-text">Dr. {doctorName}</span> 👋
                    </h1>
                    <p className="text-text-secondary text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        {format(today, "EEEE, MMMM d, yyyy")} · Dashboard live
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border-light text-sm font-semibold text-text-secondary hover:bg-surface transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link href="/doctor/appointments" className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                        <Calendar className="w-4 h-4" />
                        Manage Schedule
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-border-light p-6 h-36 animate-pulse">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
                            <div className="w-24 h-6 bg-slate-100 rounded mb-2" />
                            <div className="w-32 h-3 bg-slate-50 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                            className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer"
                        >
                            {/* Background orb */}
                            <div className={`absolute -right-8 -top-8 w-28 h-28 ${stat.bg} rounded-full opacity-40 group-hover:scale-150 transition-transform duration-700`} />
                            <div className={`absolute -right-4 -top-4 w-16 h-16 ${stat.bg} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`} />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className={`w-5 h-5 ${stat.text}`} />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                </div>

                                <div className="mb-3">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-text-primary">
                                            {stat.value}
                                        </span>
                                        {stat.suffix && <span className="text-lg font-bold text-text-muted">{stat.suffix}</span>}
                                    </div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
                                </div>

                                <div className="pt-3 border-t border-border-light">
                                    <span className="text-xs font-semibold text-text-secondary">{stat.change}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-[32px] border border-border-light shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-border-light flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-text-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Today's Appointments
                            </h3>
                            <p className="text-xs text-text-muted mt-0.5">{format(today, "EEEE, MMMM d")}</p>
                        </div>
                        <Link href="/doctor/appointments" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="p-4 space-y-2">
                        <AnimatePresence>
                            {appointments.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                                        <Calendar className="w-7 h-7 text-text-muted opacity-40" />
                                    </div>
                                    <p className="font-semibold text-text-secondary">No appointments scheduled today</p>
                                    <Link href="/doctor/appointments" className="mt-3 text-sm text-primary font-semibold hover:underline">
                                        View full schedule
                                    </Link>
                                </motion.div>
                            ) : (
                                appointments.map((apt, i) => {
                                    const aptTime = new Date(apt.time);
                                    const isPastTime = isPast(aptTime);
                                    return (
                                        <motion.div
                                            key={apt.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all group cursor-pointer hover:shadow-sm ${isPastTime ? 'border-border-light bg-slate-50/50' : 'border-border-light hover:border-primary/20 hover:bg-primary/[0.02]'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl ${isPastTime ? 'bg-slate-100' : 'bg-primary/5 group-hover:bg-primary/10'} transition-colors`}>
                                                    <Clock className={`w-4 h-4 ${isPastTime ? 'text-slate-400' : 'text-primary'} mb-0.5`} />
                                                    <span className="text-[11px] font-bold text-text-primary">{format(aptTime, "h:mm")}</span>
                                                    <span className="text-[9px] font-bold text-text-muted">{format(aptTime, "a")}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-text-primary">{apt.patient}</h4>
                                                    <p className="text-xs text-text-secondary font-medium mt-0.5">{apt.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${statusColors[apt.status] || 'bg-surface text-text-muted'}`}>
                                                    {statusLabels[apt.status] || apt.status}
                                                </span>
                                                <Link
                                                    href="/doctor/chat"
                                                    className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center text-text-muted hover:bg-primary/10 hover:text-primary transition-all"
                                                    title="Message patient"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </Link>
                                                <button className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center text-text-muted hover:bg-surface transition-all">
                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Patient Analytics Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-[32px] border border-border-light shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text-primary flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                Patient Activity
                            </h3>
                            <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded-lg border border-border-light">7 days</span>
                        </div>

                        {weeklyData.length > 0 ? (
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6C3CE1" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f7ff', radius: 6 }} />
                                        <Bar dataKey="patients" shape={<CustomBar />} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-44 flex items-center justify-center">
                                <div className="text-center">
                                    <Activity className="w-8 h-8 text-text-muted opacity-20 mx-auto mb-2" />
                                    <p className="text-sm text-text-muted">No activity data yet</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-border-light flex items-center justify-between mt-2">
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase">Avg. / Week</p>
                                <p className="text-lg font-bold text-text-primary">
                                    {weeklyData.length > 0
                                        ? Math.round(weeklyData.reduce((s, d) => s + d.patients, 0) / Math.max(weeklyData.length, 1))
                                        : 0} visits
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                <TrendingUp className="w-3 h-3" />
                                Active
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Links / Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-6 rounded-[32px] border border-border-light shadow-sm"
                    >
                        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-primary" />
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: "View My Patients", href: "/doctor/patients", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                                { label: "Patient Encounters", href: "/doctor/encounters", icon: BrainCircuit, color: "text-indigo-500", bg: "bg-indigo-50" },
                                { label: "Add Clinical Note", href: "/doctor/notes", icon: ClipboardList, color: "text-emerald-500", bg: "bg-emerald-50" },
                                { label: "Patient Messages", href: "/doctor/chat", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50" },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border-light hover:border-primary/20 hover:bg-primary/[0.02] transition-all group"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                    </div>
                                    <span className="text-sm font-semibold text-text-secondary group-hover:text-primary transition-colors flex-1">{item.label}</span>
                                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom: Pending Actions Banner */}
            {!loading && stats && (stats.todaysCount > 0 || stats.totalPatients > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-800 text-sm">Review Lab Results</p>
                            <p className="text-xs text-amber-600">Patients awaiting confirmation</p>
                        </div>
                        <Link href="/doctor/encounters" className="ml-auto text-amber-700 hover:text-amber-900 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-800 text-sm">Patient Messages</p>
                            <p className="text-xs text-blue-600">Check your patient inbox</p>
                        </div>
                        <Link href="/doctor/chat" className="ml-auto text-blue-700 hover:text-blue-900 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-800 text-sm">Patient Reviews</p>
                            <p className="text-xs text-emerald-600">{stats.reviewCount} total · Avg {stats.avgRating} ★</p>
                        </div>
                        <Link href="/doctor/reviews" className="ml-auto text-emerald-700 hover:text-emerald-900 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
