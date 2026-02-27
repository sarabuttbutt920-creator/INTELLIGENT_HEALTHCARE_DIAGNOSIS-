"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Search,
    Filter,
    Stethoscope,
    Building2,
    Award,
    CheckCircle2,
    XCircle,
    Clock,
    UserPlus,
    Download,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Activity,
    MoreVertical,
    Trash2,
    Search as SearchIcon
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Doctor {
    doctor_id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    specialization: string;
    license_no: string | null;
    hospital_name: string | null;
    verification_status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
    is_active: boolean;
    created_at: string;
}

export default function ManageDoctorsPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [stats, setStats] = useState({ total_doctors: 0, verified: 0, pending: 0, suspended: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [verifyStatus, setVerifyStatus] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const doctorsPerPage = 10;

    // --- Search Debouncing ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset page on new search
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Handle filter changes resetting page
    useEffect(() => {
        setCurrentPage(1);
    }, [verifyStatus]);

    // --- Data Fetching ---
    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: doctorsPerPage.toString(),
                search: debouncedSearch,
                verifyStatus
            });
            const res = await fetch(`/api/admin/doctors?${params.toString()}`);
            const data = await res.json();
            if (res.ok) {
                setDoctors(data.doctors);
                setTotalPages(data.totalPages);
                setTotalItems(data.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/doctors/stats");
            const data = await res.json();
            if (res.ok) {
                setStats({
                    total_doctors: data.totalDoctors,
                    verified: data.verifiedDoctors,
                    pending: data.pendingDoctors,
                    suspended: data.inactiveAccounts
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDoctors();
        fetchStats();
    }, [currentPage, debouncedSearch, verifyStatus]);

    // --- API Mutation Actions ---
    const verifyDoctor = async (id: string) => {
        if (!confirm("Are you sure you want to verify this doctor? They will gain full platform access.")) return;
        try {
            const res = await fetch(`/api/admin/doctors/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verification_status: "APPROVED", is_active: true })
            });
            if (res.ok) {
                fetchDoctors();
                fetchStats();
            } else {
                alert("Failed to verify doctor");
            }
        } catch (err) {
            alert("An error occurred");
        }
    };

    const toggleDoctorStatus = async (doc: Doctor) => {
        try {
            const res = await fetch(`/api/admin/doctors/${doc.doctor_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !doc.is_active })
            });
            if (res.ok) {
                fetchDoctors();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteDoctor = async (id: string) => {
        if (!confirm("Delete this doctor completely? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchDoctors();
                fetchStats();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Email", "Specialization", "Hospital", "Verified", "Active", "Joined"];
        const rows = doctors.map(d => [
            d.doctor_id,
            `"${d.full_name}"`,
            d.email,
            `"${d.specialization}"`,
            `"${d.hospital_name || 'N/A'}"`,
            d.verification_status === "APPROVED" ? "Yes" : "No",
            d.is_active ? "Yes" : "No",
            new Date(d.created_at).toLocaleDateString()
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `doctors_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Manage Doctors</h1>
                    <p className="text-text-muted mt-1">Review, approve, and manage registered medical professionals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    {/* Note: User stated "DOctor is not create by admin" - hiding invite button */}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Registered", value: stats.total_doctors, icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Verified Specialists", value: stats.verified, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Pending Approvals", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Accounts Suspended", value: stats.suspended, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 card-hover"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || verifyStatus !== "ALL"
                                ? "bg-primary/5 border-primary/20 text-primary"
                                : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {verifyStatus !== "ALL" && (
                                <span className="w-2 h-2 rounded-full bg-primary ml-1" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-border-light flex gap-4">
                                <div className="space-y-1.5 flex-1 max-w-xs">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Verification Status</label>
                                    <select
                                        value={verifyStatus}
                                        onChange={(e) => setVerifyStatus(e.target.value as any)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Doctors</option>
                                        <option value="VERIFIED">Officially Verified</option>
                                        <option value="PENDING">Pending Verification</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {verifyStatus !== "ALL" && (
                                        <button
                                            onClick={() => setVerifyStatus("ALL")}
                                            className="text-sm text-red-500 font-medium hover:underline p-2"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Doctor Details</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Specialization</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Hospital / Clinic</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Date Joined</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                            <p className="font-medium text-sm">Loading doctors...</p>
                                        </td>
                                    </tr>
                                ) : doctors.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No doctors found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    doctors.map((doc) => {
                                        return (
                                            <motion.tr
                                                key={doc.doctor_id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                            >
                                                {/* Doctor Info */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-sm ring-1 ring-primary/20">
                                                            {doc.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-text-primary text-sm tracking-tight">{doc.full_name}</p>
                                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted font-medium">
                                                                <Mail className="w-3.5 h-3.5" />
                                                                {doc.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Specialization */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 inline-flex items-center px-3 py-1.5 rounded-lg tracking-wide">
                                                        {doc.specialization}
                                                    </p>
                                                </td>

                                                {/* Hospital */}
                                                <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-text-secondary bg-surface inline-flex px-3 py-1.5 rounded-lg border border-border-light">
                                                        <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                                                        <span className="truncate">{doc.hospital_name || <span className="italic text-text-muted/60">No Practice Set</span>}</span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {doc.verification_status !== "APPROVED" ? (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border capitalize tracking-wide ${doc.verification_status === "SUSPENDED" ? "bg-rose-100 text-rose-700 border-rose-200" :
                                                            doc.verification_status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200" :
                                                                "bg-amber-100 text-amber-700 border-amber-200"
                                                            }`}>
                                                            {doc.verification_status === "SUSPENDED" ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                            {doc.verification_status.replace("_", " ").toLowerCase()}
                                                        </span>
                                                    ) : doc.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border capitalize tracking-wide bg-emerald-50 text-emerald-700 border-emerald-200">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Verified & Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border capitalize tracking-wide bg-rose-50 text-rose-700 border-rose-200">
                                                            <XCircle className="w-4 h-4" />
                                                            Suspended
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Dates */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-secondary">
                                                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1.5">

                                                        {doc.verification_status !== "APPROVED" && (
                                                            <button
                                                                onClick={() => verifyDoctor(doc.doctor_id)}
                                                                className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                                                                title="Verify Doctor Profile"
                                                            >
                                                                <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                            </button>
                                                        )}

                                                        {doc.verification_status === "APPROVED" && (
                                                            <button
                                                                onClick={() => toggleDoctorStatus(doc)}
                                                                className={`p-2.5 rounded-xl transition-all shadow-sm border group ${doc.is_active
                                                                    ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white'
                                                                    : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                                    }`}
                                                                title={doc.is_active ? "Suspend Doctor" : "Reactivate Doctor"}
                                                            >
                                                                {doc.is_active ? <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                                            </button>
                                                        )}

                                                        <Link href={`/admin/doctors/${doc.doctor_id}`}>
                                                            <button
                                                                className="p-2.5 rounded-xl bg-surface border border-border-light text-text-secondary hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-sm transition-all group"
                                                                title="View Doctor Details"
                                                            >
                                                                <SearchIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                            </button>
                                                        </Link>

                                                        <button
                                                            onClick={() => deleteDoctor(doc.doctor_id)}
                                                            className="p-2.5 rounded-xl bg-surface border border-border-light text-text-secondary hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 hover:shadow-sm transition-all group"
                                                            title="Delete Doctor"
                                                        >
                                                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border-light bg-surface flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                            Showing <span className="font-semibold text-text-primary">{(currentPage - 1) * doctorsPerPage + (totalItems > 0 ? 1 : 0)}</span> to{" "}
                            <span className="font-semibold text-text-primary">
                                {Math.min(currentPage * doctorsPerPage, totalItems)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{totalItems}</span> entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === idx + 1
                                        ? "gradient-primary text-white shadow-sm"
                                        : "border border-border-light bg-white text-text-secondary hover:bg-surface"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
