"use client";

import { motion } from "framer-motion";
import {
    Users,
    ArrowUpRight,
    ArrowDownRight,
    ClipboardList,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal
} from "lucide-react";

/* Mock Stats */
const stats = [
    {
        label: "Total Patients",
        value: "2,543",
        change: "+12.5%",
        isUp: true,
        icon: Users,
        color: "blue"
    },
    {
        label: "Diagnostic Tests",
        value: "842",
        change: "+18.2%",
        isUp: true,
        icon: ClipboardList,
        color: "purple"
    },
    {
        label: "Positive CKD",
        value: "124",
        change: "-3.1%",
        isDown: true,
        icon: AlertCircle,
        color: "red"
    },
    {
        label: "Success Rate",
        value: "98.4%",
        change: "+2.4%",
        isUp: true,
        icon: CheckCircle2,
        color: "emerald"
    },
];

/* Mock Recent Tests */
const recentTests = [
    {
        id: "TEST-042",
        patient: "Sarah Mitchell",
        date: "2 hours ago",
        status: "Positive",
        score: "0.89",
        avatar: "S"
    },
    {
        id: "TEST-041",
        patient: "James Anderson",
        date: "5 hours ago",
        status: "Negative",
        score: "0.12",
        avatar: "J"
    },
    {
        id: "TEST-040",
        patient: "Emily Roberts",
        date: "Yesterday",
        status: "Awaiting",
        score: "---",
        avatar: "E"
    },
    {
        id: "TEST-039",
        patient: "Robert Chen",
        date: "Yesterday",
        status: "Negative",
        score: "0.05",
        avatar: "R"
    },
    {
        id: "TEST-038",
        patient: "Maria Garcia",
        date: "2 days ago",
        status: "Positive",
        score: "0.94",
        avatar: "M"
    },
];

export default function AdminOverview() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
                <p className="text-text-secondary text-sm">Overview of kidney health diagnostics and patient data</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? "text-emerald-600" : "text-red-600"}`}>
                                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Tests Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-light flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">Recent Diagnostics</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface/50">
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Patient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Risk Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {recentTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-surface/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-white uppercase">
                                                    {test.avatar}
                                                </div>
                                                <span className="text-sm font-semibold text-text-primary">{test.patient}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                {test.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-bold ${Number(test.score) > 0.5 ? "text-red-500" : "text-emerald-500"}`}>
                                                {test.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${test.status === "Positive" ? "bg-red-50 text-red-600" :
                                                    test.status === "Negative" ? "bg-emerald-50 text-emerald-600" :
                                                        "bg-amber-50 text-amber-600"
                                                }`}>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg hover:bg-surface text-text-muted transition-colors opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column - Kidney Health Summary */}
                <div className="space-y-6">
                    <div className="bg-[#0F172A] p-6 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Platform Health</h3>
                        <p className="text-xs text-slate-400 mb-6 font-medium">System performance and diagnostic accuracy</p>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Model Accuracy</span>
                                    <span className="text-primary-light">98.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-light rounded-full w-[98.2%]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Daily Goal</span>
                                    <span className="text-emerald-400">84%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full w-[84%]" />
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-sm font-semibold">
                            Generate System Report
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                        <h3 className="font-bold text-text-primary mb-4">Urgent Attention</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Anemia Symptoms", count: 12, color: "red" },
                                { name: "High Creatinine", count: 8, color: "amber" },
                                { name: "Abnormal PCV", count: 5, color: "blue" },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-surface/50 border border-border-light">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                                        <span className="text-sm font-medium text-text-secondary">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-text-primary px-2 py-0.5 rounded-lg bg-white border border-border-light">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
