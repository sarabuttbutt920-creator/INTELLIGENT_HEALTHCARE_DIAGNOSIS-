"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    MoreVertical,
    UserX,
    UserCheck,
    Stethoscope,
    Building2,
    Award,
    Star,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    UserPlus,
    Download
} from "lucide-react";
import { format } from "date-fns";

// --- Types ---
type DoctorStatus = "active" | "inactive" | "pending";

interface Doctor {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    hospitalName: string;
    licenseNo: string;
    experienceYears: number;
    fee: number;
    rating: number;
    status: DoctorStatus;
    joinedAt: string;
    avatar?: string;
}

// --- Mock Data ---
const mockDoctors: Doctor[] = [
    {
        id: "DOC-2041",
        fullName: "Dr. Sarah Jenkins",
        email: "sarah.j@mediintel.com",
        phone: "+1 (555) 123-4567",
        specialization: "Nephrologist",
        hospitalName: "Central City Hospital",
        licenseNo: "MED-987654",
        experienceYears: 12,
        fee: 150.00,
        rating: 4.8,
        status: "active",
        joinedAt: "2023-11-15T08:30:00Z",
        avatar: "S"
    },
    {
        id: "DOC-2042",
        fullName: "Dr. James Wilson",
        email: "james.wilson@mediintel.com",
        phone: "+1 (555) 321-0987",
        specialization: "General Physician",
        hospitalName: "Mercy General Diagnostics",
        licenseNo: "MED-123456",
        experienceYears: 8,
        fee: 100.00,
        rating: 4.5,
        status: "active",
        joinedAt: "2023-11-20T09:00:00Z",
        avatar: "J"
    },
    {
        id: "DOC-2043",
        fullName: "Dr. Emily Rodriguez",
        email: "emily.rod@outlook.com",
        phone: "+1 (555) 456-7890",
        specialization: "Urologist",
        hospitalName: "Valley Medical Center",
        licenseNo: "MED-456789",
        experienceYears: 15,
        fee: 200.00,
        rating: 4.9,
        status: "inactive",
        joinedAt: "2023-12-05T16:00:00Z",
        avatar: "E"
    },
    {
        id: "DOC-2044",
        fullName: "Dr. Hassan Ali",
        email: "h.ali_dr@hospital.com",
        phone: "+1 (555) 999-8888",
        specialization: "Internal Medicine",
        hospitalName: "National Health Institute",
        licenseNo: "MED-334455",
        experienceYears: 5,
        fee: 120.00,
        rating: 0,
        status: "pending",
        joinedAt: "2024-02-20T10:15:00Z",
        avatar: "H"
    },
    {
        id: "DOC-2045",
        fullName: "Dr. Amanda Chen",
        email: "amanda.c.dr@health.org",
        phone: "+1 (555) 777-6666",
        specialization: "Nephrologist",
        hospitalName: "Central City Hospital",
        licenseNo: "MED-112233",
        experienceYears: 20,
        fee: 250.00,
        rating: 5.0,
        status: "active",
        joinedAt: "2023-10-10T14:45:00Z",
        avatar: "A"
    },
    {
        id: "DOC-2046",
        fullName: "Dr. Robert King",
        email: "r.king.med@clinic.com",
        phone: "+1 (555) 111-2222",
        specialization: "Cardiologist",
        hospitalName: "HeartCare Clinic",
        licenseNo: "MED-998877",
        experienceYears: 10,
        fee: 180.00,
        rating: 4.2,
        status: "pending",
        joinedAt: "2024-02-25T09:00:00Z",
        avatar: "R"
    }
];

// --- Helpers ---
const statusStyles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    inactive: "bg-rose-100 text-rose-700 border-rose-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200"
};

const statusIcons = {
    active: CheckCircle2,
    inactive: XCircle,
    pending: Clock
};

export default function ManageDoctorsPage() {
    // --- State ---
    const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<DoctorStatus | "ALL">("ALL");
    const [specializationFilter, setSpecializationFilter] = useState<string>("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Derived distinct specializations
    const uniqueSpecializations = useMemo(() => {
        const specs = new Set(doctors.map(d => d.specialization));
        return Array.from(specs).sort();
    }, [doctors]);

    // --- Actions ---
    const toggleStatus = (id: string, newStatus: DoctorStatus) => {
        setDoctors(doctors.map(doc => {
            if (doc.id === id) {
                return { ...doc, status: newStatus };
            }
            return doc;
        }));
    };

    // --- Derived Data ---
    const filteredDoctors = useMemo(() => {
        return doctors.filter(doc => {
            const matchesSearch =
                doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.licenseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;
            const matchesSpec = specializationFilter === "ALL" || doc.specialization === specializationFilter;

            return matchesSearch && matchesStatus && matchesSpec;
        });
    }, [doctors, searchTerm, statusFilter, specializationFilter]);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const paginatedDoctors = filteredDoctors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, specializationFilter]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Manage Doctors</h1>
                    <p className="text-text-muted mt-1">Review, approve, and manage registered medical professionals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <UserPlus className="w-4 h-4" />
                        Invite Doctor
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Doctors", value: doctors.length, icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Active Specialists", value: doctors.filter(d => d.status === "active").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Pending Approvals", value: doctors.filter(d => d.status === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Avg. Experience", value: `${Math.round(doctors.reduce((sum, d) => sum + d.experienceYears, 0) / (doctors.length || 1))} Yrs`, icon: Award, color: "text-blue-500", bg: "bg-blue-50" },
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
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
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
                            placeholder="Search by name, license, or hospital..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || statusFilter !== "ALL" || specializationFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(statusFilter !== "ALL" || specializationFilter !== "ALL") && (
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
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as DoctorStatus | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Specialization</label>
                                    <select
                                        value={specializationFilter}
                                        onChange={(e) => setSpecializationFilter(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Specializations</option>
                                        {uniqueSpecializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(statusFilter !== "ALL" || specializationFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setStatusFilter("ALL");
                                                setSpecializationFilter("ALL");
                                            }}
                                            className="text-sm text-red-500 font-medium hover:underline"
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
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-semibold">Doctor Details</th>
                                <th className="px-6 py-4 font-semibold">Hospital & License</th>
                                <th className="px-6 py-4 font-semibold">Experience & Fee</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Rating / Date Joined</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedDoctors.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No doctors found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDoctors.map((doc) => {
                                        const StatusIcon = statusIcons[doc.status];
                                        return (
                                            <motion.tr
                                                key={doc.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                            >
                                                {/* Doctor Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {doc.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-text-primary">{doc.fullName}</p>
                                                            <p className="text-xs text-primary font-medium">{doc.specialization}</p>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                                                                <Mail className="w-3 h-3" />
                                                                {doc.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Hospital & License */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
                                                            <Building2 className="w-3.5 h-3.5 text-text-muted" />
                                                            {doc.hospitalName}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                                                            <Activity className="w-3.5 h-3.5" />
                                                            {doc.licenseNo}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Experience & Fee */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                            <Award className="w-3.5 h-3.5 text-blue-500" />
                                                            {doc.experienceYears} Years Exp.
                                                        </div>
                                                        <div className="text-sm font-semibold text-text-primary pl-5.5">
                                                            ${doc.fee.toFixed(2)} / Visit
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border capitalize tracking-wide ${statusStyles[doc.status]}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {doc.status}
                                                    </span>
                                                </td>

                                                {/* Dates and Rating */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-sm text-text-primary font-bold">
                                                            <Star className={`w-4 h-4 ${doc.rating > 0 ? "text-amber-400 fill-amber-400" : "text-border-light"}`} />
                                                            {doc.rating > 0 ? doc.rating.toFixed(1) : "New"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {format(new Date(doc.joinedAt), "MMM d, yyyy")}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {doc.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => toggleStatus(doc.id, 'active')}
                                                                    className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                    title="Approve Doctor"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleStatus(doc.id, 'inactive')}
                                                                    className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                    title="Reject Doctor"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {doc.status === 'active' && (
                                                            <button
                                                                onClick={() => toggleStatus(doc.id, 'inactive')}
                                                                className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                title="Deactivate Account"
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {doc.status === 'inactive' && (
                                                            <button
                                                                onClick={() => toggleStatus(doc.id, 'active')}
                                                                className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                title="Reactivate Account"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button className="p-2 rounded-lg bg-surface border border-border-light text-text-secondary hover:bg-border-light transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
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
                            Showing <span className="font-semibold text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                            <span className="font-semibold text-text-primary">
                                {Math.min(currentPage * itemsPerPage, filteredDoctors.length)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{filteredDoctors.length}</span> doctors
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
