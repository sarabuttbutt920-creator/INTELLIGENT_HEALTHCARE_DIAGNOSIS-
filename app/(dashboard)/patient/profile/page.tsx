"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Activity,
    HeartPulse,
    Pill,
    AlertCircle,
    Droplets,
    Calendar,
    Weight,
    Stethoscope,
    Edit3,
    Camera,
    FileText,
    Clock,
    Thermometer
} from "lucide-react";
import { format, parseISO, differenceInYears, formatDistanceToNow } from "date-fns";

// --- Mock Data ---
const patientData = {
    id: "PAT-8041",
    fullName: "Michael Chen",
    avatarInitials: "MC",
    email: "michael.chen@email.com",
    phone: "+1 (555) 987-6543",
    address: "1234 Willow Lane, Suite 2B\nSan Francisco, CA 94107",
    dob: "1982-05-14",
    gender: "Male",
    bloodType: "O+",
    height: "5' 10\" (178 cm)",
    weight: "175 lbs (79 kg)",
    bmi: "25.1",
    insurance: {
        provider: "BlueCross Core Health",
        policyNumber: "POL-982441-A",
        groupNumber: "GRP-441-X",
        status: "Active"
    },
    emergencyContact: {
        name: "Sarah Chen",
        relation: "Spouse",
        phone: "+1 (555) 987-1122"
    },
    allergies: ["Penicillin", "Peanuts", "Latex"],
    medications: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
        { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime" }
    ],
    conditions: ["Hypertension", "CKD Stage 3a (Monitored)"],
    latestVitals: {
        bloodPressure: "128/82",
        heartRate: "72",
        spo2: "98",
        temperature: "98.6",
        lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
    }
};

export default function PatientProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const calculatedAge = differenceInYears(new Date(), parseISO(patientData.dob));

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Health Profile</h1>
                    <p className="text-text-muted mt-1">Manage your personal information, medical history, and clinical vitals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary transition-colors shadow-sm font-medium text-sm">
                        <FileText className="w-4 h-4" />
                        Download PDF Record
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm"
                    >
                        <Edit3 className="w-4 h-4" />
                        {isEditing ? "Save Changes" : "Edit Profile"}
                    </button>
                </div>
            </div>

            {/* Profile Cover & Header Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden relative">

                {/* Cover Banner */}
                <div className="h-40 md:h-56 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    {isEditing && (
                        <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-colors border border-white/20">
                            <Camera className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Avatar & Main Info */}
                <div className="px-6 pb-6 md:px-10 relative">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-6 relative z-10">
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 gradient-primary flex items-center justify-center text-5xl font-bold text-white">
                                    {patientData.avatarInitials}
                                </div>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>
                            <span className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" title="Account Active"></span>
                        </div>

                        <div className="flex-1 pb-2">
                            <h2 className="text-3xl font-black text-text-primary flex items-center gap-3">
                                {patientData.fullName}
                                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shadow-sm">
                                    {patientData.id}
                                </span>
                            </h2>
                            <p className="text-text-secondary font-medium mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-muted" /> {calculatedAge} years old</span>
                                <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-text-muted" /> {patientData.gender}</span>
                                <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-rose-500" /> Type {patientData.bloodType}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Metric Bar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-surface rounded-2xl border border-border-light">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-0.5">Height</p>
                                <p className="font-semibold text-text-primary text-sm">{patientData.height}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Weight className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-0.5">Weight</p>
                                <p className="font-semibold text-text-primary text-sm">{patientData.weight}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-0.5">BMI</p>
                                <p className="font-semibold text-text-primary text-sm">{patientData.bmi} <span className="text-xs font-normal text-text-muted">(Overweight)</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-0.5">Insurance</p>
                                <p className="font-semibold text-text-primary text-sm truncate max-w-[120px]" title={patientData.insurance.provider}>{patientData.insurance.provider}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Split Layout Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Contact & Admin Details */}
                <div className="space-y-6">

                    {/* Contact Info Card */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-border-light shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                        <h3 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Contact Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                                {isEditing ?
                                    <input type="email" defaultValue={patientData.email} className="w-full p-2 border border-border-light rounded-lg text-sm bg-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                                    : <p className="text-sm font-medium text-text-primary break-all">{patientData.email}</p>
                                }
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1"><Phone className="w-3.5 h-3.5" /> Phone Number</label>
                                {isEditing ?
                                    <input type="tel" defaultValue={patientData.phone} className="w-full p-2 border border-border-light rounded-lg text-sm bg-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                                    : <p className="text-sm font-medium text-text-primary">{patientData.phone}</p>
                                }
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5" /> Residential Address</label>
                                {isEditing ?
                                    <textarea defaultValue={patientData.address} rows={2} className="w-full p-2 border border-border-light rounded-lg text-sm bg-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 line-clamp-2 resize-none" />
                                    : <p className="text-sm font-medium text-text-primary whitespace-pre-wrap leading-relaxed">{patientData.address}</p>
                                }
                            </div>
                        </div>
                    </motion.div>

                    {/* Emergency Contact */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-rose-50 border border-rose-100 rounded-3xl p-6 shadow-sm shadow-rose-100/50 relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

                        <h3 className="text-lg font-bold text-rose-800 mb-5 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" /> Emergency Contact
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 block">Primary Contact</label>
                                <p className="text-sm font-bold text-rose-900">{patientData.emergencyContact.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 block">Relation</label>
                                    <p className="text-sm font-medium text-rose-800">{patientData.emergencyContact.relation}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 block">Phone</label>
                                    <p className="text-sm font-medium text-rose-800">{patientData.emergencyContact.phone}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Insurance Card */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl border border-border-light shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />

                        <h3 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2 pl-2">
                            <Shield className="w-5 h-5 text-indigo-500" /> Health Insurance
                        </h3>

                        <div className="pl-2 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Provider</label>
                                <p className="text-sm font-bold text-text-primary">{patientData.insurance.provider}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Policy No.</label>
                                    <p className="text-sm font-mono font-semibold text-text-secondary">{patientData.insurance.policyNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Group No.</label>
                                    <p className="text-sm font-mono font-semibold text-text-secondary">{patientData.insurance.groupNumber}</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {patientData.insurance.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Medical Dashboard */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Vitals Dashboard */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl border border-border-light shadow-sm p-6">
                        <div className="flex justify-between items-end mb-6 border-b border-border-light pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-1">
                                    <HeartPulse className="w-5 h-5 text-primary" /> Current Vitals
                                </h3>
                                <p className="text-xs text-text-muted flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Last recorded: {format(parseISO(patientData.latestVitals.lastUpdated), "MMM d, yyyy h:mm a")}
                                    <span className="italic ml-1">({formatDistanceToNow(parseISO(patientData.latestVitals.lastUpdated))} ago)</span>
                                </p>
                            </div>
                            <button className="text-sm text-primary font-semibold hover:underline bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">Log New Vitals</button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Blood Pressure */}
                            <div className="bg-surface p-4 rounded-2xl border border-border-light relative overflow-hidden group hover:border-blue-200 hover:shadow-sm transition-all">
                                <Activity className="w-6 h-6 text-blue-500 mb-3" />
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Blood Pressure</p>
                                <p className="text-2xl font-black text-text-primary font-mono tracking-tighter">{patientData.latestVitals.bloodPressure}<span className="text-xs text-text-muted font-normal ml-1 tracking-normal">mmHg</span></p>
                            </div>

                            {/* Heart Rate */}
                            <div className="bg-surface p-4 rounded-2xl border border-border-light relative overflow-hidden group hover:border-rose-200 hover:shadow-sm transition-all">
                                <HeartPulse className="w-6 h-6 text-rose-500 mb-3" />
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Heart Rate</p>
                                <p className="text-2xl font-black text-text-primary font-mono tracking-tighter">{patientData.latestVitals.heartRate}<span className="text-xs text-text-muted font-normal ml-1 tracking-normal">bpm</span></p>
                            </div>

                            {/* SpO2 */}
                            <div className="bg-surface p-4 rounded-2xl border border-border-light relative overflow-hidden group hover:border-indigo-200 hover:shadow-sm transition-all">
                                <svg className="w-6 h-6 text-indigo-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">SpO2 Level</p>
                                <p className="text-2xl font-black text-text-primary font-mono tracking-tighter">{patientData.latestVitals.spo2}<span className="text-xs text-text-muted font-normal ml-1 tracking-normal">%</span></p>
                            </div>

                            {/* Temperature */}
                            <div className="bg-surface p-4 rounded-2xl border border-border-light relative overflow-hidden group hover:border-amber-200 hover:shadow-sm transition-all">
                                <Thermometer className="w-6 h-6 text-amber-500 mb-3" />
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Body Temp</p>
                                <p className="text-2xl font-black text-text-primary font-mono tracking-tighter">{patientData.latestVitals.temperature}<span className="text-xs text-text-muted font-normal ml-1 tracking-normal">°F</span></p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Conditions & Allergies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Active Conditions */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-50/50 rounded-3xl border border-amber-100 shadow-sm p-6 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-500" /> Diagnosed Conditions
                            </h3>
                            <ul className="space-y-3">
                                {patientData.conditions.map(condition => (
                                    <li key={condition} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
                                        <div className="mt-0.5"><AlertCircle className="w-4 h-4 text-amber-600" /></div>
                                        <p className="font-semibold text-text-primary text-sm">{condition}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Known Allergies */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-rose-50/50 rounded-3xl border border-rose-100 shadow-sm p-6 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-rose-500" /> Known Allergies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {patientData.allergies.map(allergy => (
                                    <span key={allergy} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm">
                                        {allergy}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Active Prescriptions */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-3xl border border-border-light shadow-sm p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Pill className="w-5 h-5 text-indigo-500" /> Active Prescriptions
                            </h3>
                            <button className="text-sm font-semibold text-primary hover:underline">Request Refill</button>
                        </div>

                        <div className="space-y-3">
                            {patientData.medications.map(med => (
                                <div key={med.name} className="flex items-center justify-between p-4 rounded-xl border border-border-light bg-surface hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Pill className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary text-base flex items-center gap-2">
                                                {med.name} <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-border-light">{med.dosage}</span>
                                            </p>
                                            <p className="text-sm text-text-muted mt-0.5 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> {med.frequency}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-primary transition-all">
                                        <Activity className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>

        </div>
    );
}
