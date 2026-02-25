"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLogin = pathname === "/login";

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side - Visual/Marketing */}
            <div className="hidden lg:flex relative bg-[#0F172A] flex-col justify-between p-12 overflow-hidden">
                {/* Background Pattern/Gradients */}
                <div className="absolute top-0 left-0 w-full h-full ecg-pattern opacity-10" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />

                <Link
                    href="/"
                    className="relative z-10 flex items-center gap-2 text-white hover:text-primary-light transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            IH<span className="text-primary-light">DS</span>
                        </span>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Revolutionizing Kidney Care with <span className="gradient-text">AI Diagnostics</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mb-8">
                        Join our mission to provide early detection and intelligent healthcare solutions for chronic kidney disease patients worldwide.
                    </p>

                    <div className="space-y-4">
                        {[
                            "98% Prediction Accuracy",
                            "Real-time Patient Monitoring",
                            "Secure Health Records",
                            "Expert Doctor Consultations",
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                                <span className="text-sm font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/10 flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-gray-800" />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400">
                        Trusted by over <span className="text-white font-semibold">500+ professionals</span>
                    </p>
                </div>
            </div>

            {/* Right Side - Forms */}
            <main className="flex items-center justify-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
