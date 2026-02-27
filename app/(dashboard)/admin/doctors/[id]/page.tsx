"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Stethoscope,
    Mail,
    Phone,
    Building2,
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    Activity,
    CreditCard,
    Calendar,
    Download
} from "lucide-react";
import { format } from "date-fns";

export default function DoctorDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`/api/admin/doctors/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setDoctor(data);
                } else {
                    alert("Doctor not found: " + data.error);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchDoctor();
    }, [id]);

    const handleExportCSV = () => {
        if (!doctor) return;
        const headers = ["ID", "Full Name", "Email", "Phone", "Specialization", "License", "Hospital", "Experience", "Fee", "Verified", "Active", "Joined Date"];
        const row = [
            doctor.doctor_id,
            `"${doctor.full_name}"`,
            doctor.email,
            doctor.phone || "N/A",
            `"${doctor.specialization}"`,
            doctor.license_no || "N/A",
            `"${doctor.hospital_name || 'N/A'}"`,
            `${doctor.experience_years} Years`,
            `$${doctor.fee}`,
            doctor.verification_status === "APPROVED" ? "Yes" : "No",
            doctor.is_active ? "Yes" : "No",
            new Date(doctor.created_at).toLocaleDateString()
        ];
        const csvContent = [headers.join(","), row.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `doctor_profile_${doctor.doctor_id}.csv`;
        link.click();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!doctor) return <div className="p-10 text-center">Doctor not found.</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl mx-auto pb-10"
        >
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface hover:text-text-primary transition-all w-fit shadow-sm text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Doctors
                </button>
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm font-bold text-sm">
                        <Download className="w-4 h-4" />
                        Download Doctor Data (CSV)
                    </button>
                </div>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-white" />
                <div className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-8">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl gradient-primary text-white flex items-center justify-center font-bold text-4xl shadow-xl shadow-primary/20 border-4 border-white">
                            {doctor.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight text-text-primary capitalize">{doctor.full_name}</h1>
                            <p className="text-primary font-bold text-lg">{doctor.specialization}</p>
                        </div>
                        <div>
                            {doctor.verification_status !== "APPROVED" ? (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border capitalize tracking-wide ${doctor.verification_status === "SUSPENDED" ? "bg-rose-100 text-rose-700 border-rose-200" :
                                        doctor.verification_status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200" :
                                            "bg-amber-100 text-amber-700 border-amber-200"
                                    }`}>
                                    {doctor.verification_status === "SUSPENDED" ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    {doctor.verification_status.replace("_", " ").toLowerCase()}
                                </span>
                            ) : doctor.is_active ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border capitalize tracking-wide bg-emerald-100 text-emerald-700 border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Officially Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border capitalize tracking-wide bg-rose-100 text-rose-700 border-rose-200">
                                    <XCircle className="w-4 h-4" />
                                    Suspended Profile
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-border-light pb-2">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <Mail className="w-5 h-5 text-text-muted" />
                                    <span>{doctor.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <Phone className="w-5 h-5 text-text-muted" />
                                    <span>{doctor.phone || "Not Provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <Calendar className="w-5 h-5 text-text-muted" />
                                    <span>Joined: {format(new Date(doctor.created_at), "MMMM d, yyyy")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-border-light pb-2">Professional Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <Building2 className="w-5 h-5 text-text-muted" />
                                    <span>{doctor.hospital_name || "Independent Practice"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <Activity className="w-5 h-5 text-text-muted" />
                                    <span className="font-mono">License: {doctor.license_no || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <Award className="w-5 h-5 text-text-muted" />
                                    <span>{doctor.experience_years ? `${doctor.experience_years} Years Experience` : "Experience not listed"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Metrics */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-border-light pb-2">Metrics & Bio</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <CreditCard className="w-5 h-5 text-emerald-500" />
                                    <span className="font-bold text-text-primary text-xl">${doctor.fee} <span className="text-sm text-text-muted font-normal">/ session</span></span>
                                </div>
                            </div>
                            {doctor.bio ? (
                                <p className="text-sm text-text-muted mt-4 bg-surface p-4 rounded-xl border border-border-light leading-relaxed">
                                    "{doctor.bio}"
                                </p>
                            ) : (
                                <p className="text-sm text-text-muted italic mt-4">No bio provided by the doctor.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
