"use client";

import { motion } from "framer-motion";
import { Star, CalendarCheck } from "lucide-react";
import Image from "next/image";

/* Specialists data */
const specialists = [
    {
        name: "Dr. Sarah Mitchell",
        specialty: "Nephrologist",
        rating: 4.9,
        reviews: 124,
        image: "/images/img5.jpg",
    },
    {
        name: "Dr. James Anderson",
        specialty: "Urologist",
        rating: 4.8,
        reviews: 98,
        image: "/images/img6.jpg",
    },
    {
        name: "Dr. Emily Roberts",
        specialty: "Cardiologist",
        rating: 4.9,
        reviews: 156,
        image: "/images/img7.jpg",
    },
];

/* Star rating component */
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.floor(rating) ? "star-filled fill-amber-400" : "star-empty"
                        }`}
                />
            ))}
        </div>
    );
}

export default function Specialists() {
    return (
        <section id="specialists" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto mb-14"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                        Top Doctors
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                        Meet Our Top{" "}
                        <span className="gradient-text">Specialists</span>
                    </h2>
                    <p className="mt-4 text-text-secondary">
                        Highly experienced doctors dedicated to providing the best healthcare
                        through advanced diagnostics and compassionate care.
                    </p>
                </motion.div>

                {/* Specialist Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {specialists.map((doc, index) => (
                        <motion.div
                            key={doc.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -8 }}
                            className="group bg-white rounded-2xl overflow-hidden border border-border-light shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
                        >
                            {/* Doctor Image */}
                            <div className="relative h-64 overflow-hidden bg-gradient-to-b from-purple-50 to-indigo-50">
                                <Image
                                    src={doc.image}
                                    alt={doc.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                            </div>

                            {/* Doctor Info */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-text-primary mb-1">
                                    {doc.name}
                                </h3>
                                <p className="text-sm text-primary font-medium mb-3">
                                    {doc.specialty}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-5">
                                    <StarRating rating={doc.rating} />
                                    <span className="text-sm font-semibold text-text-primary">
                                        {doc.rating}
                                    </span>
                                    <span className="text-xs text-text-muted">
                                        ({doc.reviews} reviews)
                                    </span>
                                </div>

                                {/* Book Button */}
                                <motion.button
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <CalendarCheck className="w-4 h-4" />
                                    Book Appointment
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
