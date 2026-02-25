"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Globe } from "lucide-react";

/* Stat items data */
const stats = [
    {
        icon: Users,
        value: "30M+",
        label: "Active Users",
        color: "text-primary",
    },
    {
        icon: TrendingUp,
        value: "30%",
        label: "Growth Rate",
        color: "text-emerald-500",
    },
    {
        icon: DollarSign,
        value: "$100M",
        label: "Revenue",
        color: "text-amber-500",
    },
    {
        icon: Globe,
        value: "60+",
        label: "Countries",
        color: "text-sky-500",
    },
];

export default function Stats() {
    return (
        <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border-light p-8 sm:p-10"
                >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`flex flex-col items-center text-center relative ${index < stats.length - 1
                                        ? "lg:border-r lg:border-border-light"
                                        : ""
                                    }`}
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-3">
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                {/* Value */}
                                <p className="text-3xl sm:text-4xl font-bold text-text-primary mb-1">
                                    {stat.value}
                                </p>
                                {/* Label */}
                                <p className="text-sm text-text-secondary font-medium">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
