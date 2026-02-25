"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side - Visual/Marketing */}
            <div className="hidden lg:flex relative bg-[#0F172A] flex-col justify-between p-12 overflow-hidden">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/img4.jpg"
                        alt="Background"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 to-[#0F172A]" />
                </div>

                {/* Background Pattern/Gradients */}
                <div className="absolute top-0 left-0 w-full h-full ecg-pattern opacity-10 z-0" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] z-0" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] z-0" />

                <Link
                    href="/"
                    className="relative z-10 flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-2 mb-8"
                    >
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            IH<span className="text-primary-light">DS</span>
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl font-bold text-white mb-6 leading-tight"
                    >
                        Revolutionizing Kidney Care with <span className="gradient-text">AI Diagnostics</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-md mb-8"
                    >
                        Join our mission to provide early detection and intelligent healthcare solutions for chronic kidney disease patients worldwide.
                    </motion.p>

                    <div className="space-y-4">
                        {[
                            "98% Prediction Accuracy",
                            "Real-time Patient Monitoring",
                            "Secure Health Records",
                            "Expert Doctor Consultations",
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3 text-gray-300"
                            >
                                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                                <span className="text-sm font-medium">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="relative z-10 pt-12 border-t border-white/10 flex items-center gap-4"
                >
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] overflow-hidden bg-gray-800">
                                <Image
                                    src={`/images/img${i}.jpg`}
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-400">
                        Trusted by over <span className="text-white font-semibold">500+ professionals</span>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Forms */}
            <main className="flex items-center justify-center p-6 sm:p-12 bg-surface/30">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
