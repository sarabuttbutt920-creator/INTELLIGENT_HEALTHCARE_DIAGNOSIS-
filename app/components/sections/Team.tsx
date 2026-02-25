"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

/* Filter categories */
const categories = [
    "All",
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "Dental Care",
    "Pediatric",
];

/* Team members data */
const teamMembers = [
    {
        name: "Comprehensive Heart Care",
        category: "Cardiologist",
        description:
            "Our cardiology team provides advanced diagnostic and treatment services for all heart-related conditions using cutting-edge technology.",
        image: "/images/img1.jpg",
    },
    {
        name: "Brain & Nerve Specialists",
        category: "Neurologist",
        description:
            "Expert neurologists offering advanced neurological care with state-of-the-art diagnostic imaging and treatment protocols.",
        image: "/images/img2.jpg",
    },
    {
        name: "Skin Health Experts",
        category: "Dermatologist",
        description:
            "Dedicated dermatology team providing comprehensive skin care, from routine check-ups to advanced cosmetic procedures.",
        image: "/images/img3.jpg",
    },
    {
        name: "Advanced Dental Services",
        category: "Dental Care",
        description:
            "Full-service dental care from preventive dentistry to cosmetic and restorative treatments with modern equipment.",
        image: "/images/img4.jpg",
    },
    {
        name: "Child Health Specialists",
        category: "Pediatric",
        description:
            "Compassionate pediatric care ensuring healthy growth and development for children of all ages.",
        image: "/images/img5.jpg",
    },
    {
        name: "Kidney Disease Research",
        category: "Neurologist",
        description:
            "Pioneering research in chronic kidney disease using AI-driven predictive models for early detection and prevention.",
        image: "/images/img6.jpg",
    },
];

export default function Team() {
    const [activeCategory, setActiveCategory] = useState("All");

    /* Filter members by category */
    const filteredMembers =
        activeCategory === "All"
            ? teamMembers.slice(0, 3)
            : teamMembers.filter((m) => m.category === activeCategory).slice(0, 3);

    return (
        <section id="services" className="py-20 bg-surface-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto mb-12"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                        Our Team
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                        Our Team of Highly Trained{" "}
                        <span className="gradient-text">Medical Professionals</span>
                    </h2>
                </motion.div>

                {/* Category Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((cat) => (
                        <motion.button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                ? "gradient-primary text-white shadow-lg shadow-primary/25"
                                : "bg-white text-text-secondary border border-border-light hover:border-primary/30 hover:text-primary"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Team Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMembers.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="card-hover bg-white rounded-2xl overflow-hidden shadow-md shadow-black/5 border border-border-light"
                        >
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-primary">
                                        {member.category}
                                    </span>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-text-primary mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                    {member.description}
                                </p>
                                <motion.a
                                    href="#"
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                                    whileHover={{ x: 4 }}
                                >
                                    Learn More
                                    <ArrowRight className="w-4 h-4" />
                                </motion.a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
