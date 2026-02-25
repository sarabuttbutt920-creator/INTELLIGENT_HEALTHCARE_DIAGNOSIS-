"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Stethoscope,
    Building2,
    Award,
    Star,
    Clock,
    CalendarDays,
    FileText,
    BrainCircuit,
    Activity,
    ShieldCheck,
    Edit3,
    Camera,
    Languages,
    CheckCircle2
} from "lucide-react";

// --- Mock Data ---
const doctorProfile = {
    id: "DOC-3042",
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "dr.jenkins@hospital.com",
    phone: "+1 (555) 123-4567",
    specialization: "Nephrologist",
    licenseNo: "MD-987654321",
    experienceYears: 12,
    hospitalName: "Central Medical Center",
    location: "New York, USA",
    bio: "Board-certified nephrologist with over 12 years of experience specializing in chronic kidney disease (CKD) management, hypertension, and dialysis care. Passionate about utilizing AI-driven diagnostic tools to improve early detection and patient outcomes.",
    languages: ["English", "Spanish"],
    consultationFee: 150,
    rating: 4.9,
    reviewsCount: 128,
    status: "ACTIVE",
    joinedAt: "2020-05-10T08:00:00Z",
    stats: {
        totalPatients: 840,
        completedAppointments: 1250,
        predictionsRun: 430
    },
    schedule: {
        monday: "09:00 AM - 05:00 PM",
        tuesday: "09:00 AM - 05:00 PM",
        wednesday: "09:00 AM - 01:00 PM",
        thursday: "09:00 AM - 05:00 PM",
        friday: "09:00 AM - 04:00 PM",
        saturday: "Closed",
        sunday: "Closed"
    }
};

export default function DoctorProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Header / Profile Cover Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden relative"
            >
                {/* Cover Gradient */}
                <div className="h-48 w-full gradient-primary relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-colors">
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 sm:px-10 pb-8 relative">
                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-20 relative z-10">
                        <div className="relative group">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-white p-2 shadow-xl">
                                <div className="w-full h-full rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden relative">
                                    <span className="z-0">SJ</span>
                                    {/* Mock Image gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-primary opacity-20"></div>
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2.5 bg-white border border-border-light rounded-xl shadow-lg text-text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
                                    Dr. {doctorProfile.firstName} {doctorProfile.lastName}
                                </h1>
                                {doctorProfile.status === "ACTIVE" && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold tracking-wide shadow-sm">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        VERIFIED
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-secondary">
                                <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                    <Stethoscope className="w-4 h-4" />
                                    {doctorProfile.specialization}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-text-muted" />
                                    {doctorProfile.hospitalName}
                                </span>
                                <span className="flex items-center gap-1.5 text-amber-500">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    {doctorProfile.rating} <span className="text-text-muted font-normal">({doctorProfile.reviewsCount} reviews)</span>
                                </span>
                            </div>
                        </div>

                        {/* Global Actions */}
                        <div className="w-full sm:w-auto flex gap-3 pb-2 sm:pb-4">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${isEditing
                                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                                        : "gradient-primary text-white shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                                    }`}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {[
                    { label: "Total Patients", value: doctorProfile.stats.totalPatients, icon: User, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Consultations", value: doctorProfile.stats.completedAppointments, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "AI Predictions Used", value: doctorProfile.stats.predictionsRun, icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Years Experience", value: `${doctorProfile.experienceYears}+`, icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Details & Contact */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Contact Information */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border-light">
                                <Mail className="w-4 h-4 text-text-secondary" />
                            </span>
                            Contact Details
                        </h2>
                        <div className="space-y-5">
                            <div className="flex gap-4 items-start group">
                                <div className="mt-0.5">
                                    <Mail className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-muted">Email Address</p>
                                    <p className="text-base font-semibold text-text-primary">{doctorProfile.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group">
                                <div className="mt-0.5">
                                    <Phone className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-muted">Phone Number</p>
                                    <p className="text-base font-semibold text-text-primary">{doctorProfile.phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group">
                                <div className="mt-0.5">
                                    <MapPin className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-muted">Practice Location</p>
                                    <p className="text-base font-semibold text-text-primary">{doctorProfile.location}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group">
                                <div className="mt-0.5">
                                    <Languages className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-muted">Languages Spoken</p>
                                    <p className="text-base font-semibold text-text-primary">{doctorProfile.languages.join(", ")}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Professional Credentials */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border-light">
                                <FileText className="w-4 h-4 text-text-secondary" />
                            </span>
                            Professional Info
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-surface border border-border-light flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Medical License No.</p>
                                    <p className="font-mono font-bold text-text-primary">{doctorProfile.licenseNo}</p>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="p-4 rounded-xl bg-surface border border-border-light flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Base Consultation Fee</p>
                                    <p className="text-xl font-bold text-primary">${doctorProfile.consultationFee}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Column: Bio & Schedule */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Biography */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            About Me
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            {doctorProfile.bio}
                        </p>
                    </motion.div>

                    {/* Weekly Schedule */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-primary" />
                                Weekly Availability
                            </h2>
                            <button className="text-sm font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-1">
                                <Edit3 className="w-4 h-4" /> Edit Schedule
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                            {Object.entries(doctorProfile.schedule).map(([day, time]) => (
                                <div key={day} className="flex justify-between items-center p-3.5 rounded-xl border border-border-light bg-surface hover:bg-white transition-colors duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${time === "Closed" ? "bg-rose-400" : "bg-emerald-400"}`} />
                                        <span className="font-semibold text-text-primary capitalize">{day}</span>
                                    </div>
                                    <div className={`text-sm font-medium ${time === "Closed" ? "text-rose-500/70" : "text-text-secondary flex items-center gap-2"}`}>
                                        {time !== "Closed" && <Clock className="w-3.5 h-3.5 text-text-muted" />}
                                        {time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Save Action Banner (Only visible if Editing) */}
            {isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl border border-border-light shadow-2xl p-4 flex items-center gap-6 z-50 px-8"
                >
                    <p className="text-sm font-medium text-text-secondary">You are currently in edit mode. Ensure all changes are saved.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-colors">
                            Discard
                        </button>
                        <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-primary text-white shadow-lg shadow-primary/20">
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            )}

        </div>
    );
}
