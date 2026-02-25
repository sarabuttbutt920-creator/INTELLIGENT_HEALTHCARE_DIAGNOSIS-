"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Image from "next/image";

/* Testimonials data */
const testimonials = [
    {
        text: "The AI-powered kidney disease prediction was incredibly accurate. My doctor was able to catch early signs of CKD that traditional tests missed. This platform literally saved my life.",
        name: "Maria Thompson",
        role: "Patient, Kidney Care Program",
        rating: 5,
        image: "/images/img1.jpg",
    },
    {
        text: "As a nephrologist, I've been amazed by the prediction accuracy of this system. It has transformed how we approach early intervention and patient care at our clinic.",
        name: "Dr. Ahmed Hassan",
        role: "Chief Nephrologist, City Hospital",
        rating: 5,
        image: "/images/img2.jpg",
    },
    {
        text: "The user interface is so intuitive that even patients who aren't tech-savvy can navigate it easily. Booking appointments and viewing reports has never been more convenient.",
        name: "Sarah Williams",
        role: "Healthcare Administrator",
        rating: 5,
        image: "/images/img3.jpg",
    },
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () =>
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () =>
        setCurrentIndex(
            (prev) => (prev - 1 + testimonials.length) % testimonials.length
        );

    const current = testimonials[currentIndex];

    return (
        <section id="testimonials" className="py-20 bg-surface-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left info column */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-6">
                            What Our Clients{" "}
                            <span className="gradient-text">Say About Us</span>
                        </h2>
                        <p className="text-text-secondary leading-relaxed mb-8">
                            Our patients and healthcare professionals trust our AI-powered
                            platform for accurate kidney disease predictions and seamless
                            medical consultations.
                        </p>

                        {/* Stats badge */}
                        <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-md shadow-black/5 border border-border-light">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                                <Star className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">750+</p>
                                <p className="text-sm text-text-muted">Client Reviews</p>
                            </div>
                        </div>

                        {/* Navigation arrows */}
                        <div className="flex items-center gap-3 mt-8">
                            <motion.button
                                onClick={prev}
                                className="w-12 h-12 rounded-xl bg-white border border-border-light flex items-center justify-center hover:bg-surface transition-colors shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-5 h-5 text-text-primary" />
                            </motion.button>
                            <motion.button
                                onClick={next}
                                className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-5 h-5 text-white" />
                            </motion.button>
                            {/* Dots indicator */}
                            <div className="flex items-center gap-1.5 ml-3">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                                            ? "w-6 bg-primary"
                                            : "w-2 bg-gray-300 hover:bg-gray-400"
                                            }`}
                                        aria-label={`Go to testimonial ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right testimonial card */}
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5 border border-border-light relative">
                            {/* Quote icon */}
                            <div className="absolute -top-5 -left-3 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <Quote className="w-5 h-5 text-white" />
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-0.5 mb-6 pt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${star <= current.rating
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Quote text */}
                            <p className="text-lg text-text-primary leading-relaxed mb-8 italic">
                                &ldquo;{current.text}&rdquo;
                            </p>

                            {/* Client info */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-100">
                                    <Image
                                        src={current.image}
                                        alt={current.name}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary">{current.name}</p>
                                    <p className="text-sm text-text-secondary">{current.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative background card */}
                        <div className="absolute -bottom-3 left-4 right-4 h-12 bg-primary/5 rounded-3xl -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
