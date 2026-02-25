"use client";

import { motion, Variants } from "framer-motion";
import {
    ShieldCheck,
    Clock,
    CalendarCheck,
    Users,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* Floating badge cards for the hero image */
const floatingCards = [
    {
        icon: ShieldCheck,
        label: "Verified",
        color: "text-green-500",
        bg: "bg-green-50",
    },
    {
        icon: Clock,
        label: "Available Today",
        color: "text-primary",
        bg: "bg-purple-50",
    },
];

/* Animation variants */
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
    }),
};

export default function Hero() {
    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center overflow-hidden pt-20"
        >
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-100/20 rounded-full blur-[160px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* ===== LEFT SIDE ===== */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <motion.div
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-sm font-medium text-primary">
                                <Sparkles className="w-4 h-4" />
                                AI-Powered Healthcare Platform
                            </span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight"
                        >
                            Advanced AI For
                            <br />
                            Early <span className="gradient-text">Kidney Detection</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            custom={2}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-lg text-text-secondary max-w-xl leading-relaxed"
                        >
                            Our intelligent platform analyzes medical data to predict chronic kidney disease risk with 98% accuracy. Empowering patients and doctors with real-time diagnostic insights.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div
                            custom={3}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                        >
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white gradient-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
                            >
                                <CalendarCheck className="w-5 h-5" />
                                Start Free Analysis
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>

                            {/* Stat card */}
                            <div className="flex items-center gap-3">
                                {/* Doctor avatars */}
                                <div className="flex -space-x-3">
                                    {[
                                        "/images/img1.jpg",
                                        "/images/img2.jpg",
                                        "/images/img3.jpg",
                                    ].map((src, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm"
                                        >
                                            <Image
                                                src={src}
                                                alt={`Doctor ${i + 1}`}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary flex items-center gap-1">
                                        <Users className="w-4 h-4 text-primary" />
                                        500+
                                    </p>
                                    <p className="text-xs text-text-muted">Expert Doctors</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ===== RIGHT SIDE ===== */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative flex justify-center lg:justify-end"
                    >
                        {/* Main doctor card */}
                        <div className="relative w-full max-w-md">
                            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-purple-100/50 bg-gradient-to-b from-purple-50 to-white aspect-[4/5]">
                                <Image
                                    src="/images/img8.jpg"
                                    alt="Expert Doctor"
                                    fill
                                    className="object-cover object-top hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                            </div>

                            {/* Floating cards */}
                            {floatingCards.map((card, i) => (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.8 + i * 0.2 }}
                                    className={`absolute glass rounded-2xl px-4 py-3 shadow-lg ${i === 0
                                        ? "top-8 -left-4 sm:-left-8"
                                        : "bottom-16 -right-4 sm:-right-8"
                                        }`}
                                >
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: i * 0.5,
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                                        >
                                            <card.icon className={`w-4 h-4 ${card.color}`} />
                                        </div>
                                        <span className="text-sm font-semibold text-text-primary">
                                            {card.label}
                                        </span>
                                    </motion.div>
                                </motion.div>
                            ))}

                            {/* Pulse ring */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24">
                                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                                <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
