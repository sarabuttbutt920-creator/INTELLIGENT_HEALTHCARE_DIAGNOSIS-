"use client";

import { motion } from "framer-motion";
import {
    Users,
    Calendar,
    Clock,
    ClipboardList,
    TrendingUp,
    Search,
    MessageSquare,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Star
} from "lucide-react";
import Image from "next/image";

/* Mock Data */
const docStats = [
    { label: "Total Patients", value: "1,248", change: "+12", isUp: true, icon: Users, color: "blue" },
    { label: "Today's Appointments", value: "14", change: "4 pending", isUp: true, icon: Calendar, color: "purple" },
    { label: "Reports Reviewed", value: "86", change: "This week", isUp: true, icon: ClipboardList, color: "emerald" },
    { label: "Average Rating", value: "4.9", change: "from 320 reviews", isUp: true, icon: Star, color: "amber" },
];

const todaysAppointments = [
    { id: "APT-101", patient: "Michael Johnson", time: "09:00 AM", type: "Follow-up Follow-up", status: "Completed", risk: "Low" },
    { id: "APT-102", patient: "Sarah Mitchell", time: "10:30 AM", type: "Initial Consultation", status: "In Progress", risk: "High" },
    { id: "APT-103", patient: "David Chen", time: "11:45 AM", type: "Lab Results Review", status: "Waiting", risk: "Moderate" },
    { id: "APT-104", patient: "Emily Roberts", time: "02:00 PM", type: "Routine Checkup", status: "Scheduled", risk: "Low" },
];

export default function DoctorOverview() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Welcome, Dr. Smith 👋</h1>
                    <p className="text-text-secondary text-sm">Here is your schedule and patient overview for today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-border-light text-sm font-semibold text-text-primary hover:bg-surface transition-colors">
                        <Calendar className="w-4 h-4 text-primary" />
                        Manage Schedule
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {docStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
                            </div>
                        </div>
                        <div className="relative z-10 pt-2 border-t border-border-light flex items-center gap-1.5 min-h-[30px]">
                            <span className="text-xs font-semibold text-text-secondary">{stat.change}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Appointments List */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-border-light shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-light flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">Today's Appointments</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">View Calendar</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {todaysAppointments.map((apt) => (
                            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border-light hover:bg-surface transition-colors group">
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-surface group-hover:bg-primary/5 transition-colors">
                                        <Clock className="w-4 h-4 text-text-muted group-hover:text-primary mb-1" />
                                        <span className="text-[10px] font-bold text-text-primary">{apt.time.split(" ")[0]}</span>
                                        <span className="text-[8px] font-bold text-text-muted">{apt.time.split(" ")[1]}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-text-primary">{apt.patient}</h4>
                                        <p className="text-xs text-text-secondary font-medium mt-0.5">{apt.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                                    <div className="flex flex-col gap-1 items-start sm:items-end w-1/2 sm:w-auto">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                apt.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                    apt.status === 'Waiting' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-surface text-text-secondary'
                                            }`}>
                                            {apt.status}
                                        </span>
                                        <span className={`text-[10px] font-bold ${apt.risk === 'High' ? 'text-red-500' :
                                                apt.risk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                            {apt.risk} Risk
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center text-text-muted hover:bg-primary/10 hover:text-primary transition-all">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center text-text-muted hover:bg-surface transition-all">
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Patient Analytics */}
                    <div className="bg-white p-6 rounded-[32px] border border-border-light shadow-sm">
                        <h3 className="font-bold text-text-primary mb-6">Patient Overview</h3>
                        <div className="space-y-6">
                            <div className="relative h-48 flex items-center justify-center">
                                {/* Decorative elements for chart representation */}
                                <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div key={i} className="w-6 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                                            <div className="w-full bg-primary rounded-t-sm" style={{ height: `${h * 0.7}%` }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute bottom-0 w-full flex justify-between px-2 text-[10px] font-bold text-text-muted">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border-light flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase">Avg. Patients/Week</p>
                                    <p className="text-lg font-bold text-text-primary">142</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    +8%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white p-6 rounded-[32px] border border-border-light shadow-sm">
                        <h3 className="font-bold text-text-primary mb-4">Pending Actions</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                                <div className="mt-0.5 p-1.5 rounded-lg bg-amber-100 text-amber-600">
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-text-primary">Review Lab Results</h4>
                                    <p className="text-xs text-text-secondary mt-0.5">3 patients awaiting test result confirmation</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                                <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-text-primary">Unread Messages</h4>
                                    <p className="text-xs text-text-secondary mt-0.5">5 new messages from patients</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
