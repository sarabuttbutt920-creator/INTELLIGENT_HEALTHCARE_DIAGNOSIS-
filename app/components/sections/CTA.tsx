"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

export default function CTA() {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl gradient-dark ecg-pattern"
                >
                    {/* Decorative orbs */}
                    <div className="absolute top-10 left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-[100px]" />

                    <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
                        {/* Icon */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/10 mb-8"
                        >
                            <Heart className="w-8 h-8 text-pink-400" />
                        </motion.div>

                        {/* Heading */}
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto mb-6">
                            Join Our Team of Dedicated{" "}
                            <span className="text-purple-300">Kidney Care Specialists</span>
                        </h2>

                        {/* Subtext */}
                        <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
                            Together we can revolutionize kidney disease diagnosis using AI
                            technology and save millions of lives worldwide.
                        </p>

                        {/* CTA Button */}
                        <motion.a
                            href="#contact"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-primary-dark bg-white shadow-xl hover:shadow-2xl transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Get Consultation
                            <ArrowRight className="w-5 h-5" />
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
