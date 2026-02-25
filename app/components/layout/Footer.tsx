"use client";

import { motion } from "framer-motion";
import {
    Activity,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    ArrowUp,
} from "lucide-react";

/* Footer link groups */
const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#services" },
    { label: "Our Doctors", href: "#specialists" },
    { label: "Testimonials", href: "#testimonials" },
];

const services = [
    { label: "Kidney Diagnosis", href: "#" },
    { label: "AI Predictions", href: "#" },
    { label: "Doctor Consultation", href: "#" },
    { label: "Health Reports", href: "#" },
];

const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
];

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer id="contact" className="bg-[#0F172A] text-white relative overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                IH<span className="text-primary-light">DS</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Intelligent Healthcare Diagnosis System — powered by AI to predict
                            kidney disease early and connect you with expert doctors.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
                                >
                                    <social.icon className="w-4 h-4 text-gray-400" />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h4 className="text-base font-semibold mb-5">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-primary-light transition-colors duration-200"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Services Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h4 className="text-base font-semibold mb-5">Services</h4>
                        <ul className="space-y-3">
                            {services.map((service) => (
                                <li key={service.label}>
                                    <a
                                        href={service.href}
                                        className="text-sm text-gray-400 hover:text-primary-light transition-colors duration-200"
                                    >
                                        {service.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h4 className="text-base font-semibold mb-5">Contact Info</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                                <span className="text-sm text-gray-400">
                                    Healthcare District, Medical City, Pakistan
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-primary-light shrink-0" />
                                <span className="text-sm text-gray-400">+92 300 1234567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-primary-light shrink-0" />
                                <span className="text-sm text-gray-400">
                                    contact@ihds-health.com
                                </span>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} IHDS. All rights reserved.
                    </p>
                    <button
                        onClick={scrollToTop}
                        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </footer>
    );
}
