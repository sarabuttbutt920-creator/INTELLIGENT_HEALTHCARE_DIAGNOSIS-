"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserCircle, ShieldCheck, ArrowRight, Phone, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [role, setRole] = useState<"PATIENT" | "DOCTOR" | "ADMIN">("PATIENT");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push(`/${role.toLowerCase()}`);
        }, 1500);
    };

    return (
        <div className="relative space-y-8">
            {/* Animated Blobs for Mobile */}
            <div className="lg:hidden absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="lg:hidden absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="text-center sm:text-left relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-text-primary mb-2"
                >
                    Create Account
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-text-secondary"
                >
                    Join our community for better kidney health
                </motion.p>
            </div>

            {/* Role Switcher */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-1 bg-surface rounded-2xl flex gap-1 relative z-10 border border-border-light shadow-inner shadow-black/5 mb-6"
            >
                <button
                    onClick={() => setRole("PATIENT")}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] sm:text-sm font-semibold transition-all duration-300 ${role === "PATIENT"
                        ? "bg-white text-primary shadow-lg shadow-black/5"
                        : "text-text-muted hover:text-text-secondary"
                        }`}
                >
                    <UserCircle className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${role === "PATIENT" ? "scale-110" : ""}`} />
                    Patient
                </button>
                <button
                    onClick={() => setRole("DOCTOR")}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] sm:text-sm font-semibold transition-all duration-300 ${role === "DOCTOR"
                        ? "bg-white text-primary shadow-lg shadow-black/5"
                        : "text-text-muted hover:text-text-secondary"
                        }`}
                >
                    <Stethoscope className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${role === "DOCTOR" ? "scale-110" : ""}`} />
                    Doctor
                </button>
                <button
                    onClick={() => setRole("ADMIN")}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] sm:text-sm font-semibold transition-all duration-300 ${role === "ADMIN"
                        ? "bg-white text-primary shadow-lg shadow-black/5"
                        : "text-text-muted hover:text-text-secondary"
                        }`}
                >
                    <ShieldCheck className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${role === "ADMIN" ? "scale-110" : ""}`} />
                    Admin
                </button>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-text-primary ml-1" htmlFor="fullname">
                        Full Name
                    </label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            id="fullname"
                            type="text"
                            placeholder="John Doe"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-border-light focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm shadow-sm"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-text-primary ml-1" htmlFor="email">
                        Email Address
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-border-light focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm shadow-sm"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-text-primary ml-1" htmlFor="phone">
                        Phone Number
                    </label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            id="phone"
                            type="tel"
                            placeholder="+92 300 0000000"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-border-light focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm shadow-sm"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-text-primary ml-1" htmlFor="password">
                        Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            id="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-border-light focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm shadow-sm"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-start gap-2 pt-2 ml-1"
                >
                    <input
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 mt-0.5 rounded border-border-light text-primary focus:ring-primary cursor-pointer"
                        required
                    />
                    <label htmlFor="terms" className="text-xs text-text-secondary leading-relaxed font-medium select-none cursor-pointer">
                        I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full py-4 rounded-2xl text-white font-bold gradient-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 relative overflow-hidden mt-4"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </form>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center text-sm text-text-secondary relative z-10"
            >
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline">
                    Log in
                </Link>
            </motion.p>
        </div>
    );
}
