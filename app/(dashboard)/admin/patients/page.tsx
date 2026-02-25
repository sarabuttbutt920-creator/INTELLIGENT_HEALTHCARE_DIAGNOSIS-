"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    MoreVertical,
    UserX,
    UserCheck,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Activity,
    CheckCircle2,
    XCircle,
    User,
    Droplet,
    Dna,
    FileText,
    History,
    Download
} from "lucide-react";
import { format, differenceInYears } from "date-fns";

// --- Types ---
type PatientStatus = "active" | "inactive";

interface Patient {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    bloodGroup: string;
    emerContactName: string;
    emerContactPhone: string;
    totalEncounters: number;
    predictionsCount: number;
    status: PatientStatus;
    joinedAt: string;
    avatar?: string;
}

// --- Mock Data ---
const mockPatients: Patient[] = [
    {
        id: "PAT-8041",
        fullName: "Michael Chen",
        email: "m.chen88@gmail.com",
        phone: "+1 (555) 987-6543",
        dateOfBirth: "1988-05-14",
        gender: "MALE",
        bloodGroup: "O+",
        emerContactName: "Sarah Chen",
        emerContactPhone: "+1 (555) 987-6544",
        totalEncounters: 5,
        predictionsCount: 2,
        status: "active",
        joinedAt: "2024-01-10T11:20:00Z",
        avatar: "M"
    },
    {
        id: "PAT-8042",
        fullName: "Emily Rodriguez",
        email: "emily.rod@outlook.com",
        phone: "+1 (555) 456-7890",
        dateOfBirth: "1992-08-22",
        gender: "FEMALE",
        bloodGroup: "A-",
        emerContactName: "Carlos Rodriguez",
        emerContactPhone: "+1 (555) 456-7891",
        totalEncounters: 1,
        predictionsCount: 0,
        status: "inactive",
        joinedAt: "2023-12-05T16:00:00Z",
        avatar: "E"
    },
    {
        id: "PAT-8043",
        fullName: "Lisa Thompson",
        email: "lisa.thompson@hotmail.com",
        phone: "+1 (555) 789-0123",
        dateOfBirth: "1975-11-03",
        gender: "FEMALE",
        bloodGroup: "B+",
        emerContactName: "David Thompson",
        emerContactPhone: "+1 (555) 789-0124",
        totalEncounters: 8,
        predictionsCount: 4,
        status: "active",
        joinedAt: "2024-02-01T14:15:00Z",
        avatar: "L"
    },
    {
        id: "PAT-8044",
        fullName: "Robert Taylor",
        email: "rtaylor.77@gmail.com",
        phone: "+1 (555) 222-3333",
        dateOfBirth: "1968-02-19",
        gender: "MALE",
        bloodGroup: "AB+",
        emerContactName: "Mary Taylor",
        emerContactPhone: "+1 (555) 222-3334",
        totalEncounters: 12,
        predictionsCount: 6,
        status: "active",
        joinedAt: "2023-09-15T09:30:00Z",
        avatar: "R"
    },
    {
        id: "PAT-8045",
        fullName: "Alex Jordan",
        email: "alex.jordan@mail.com",
        phone: "+1 (555) 666-7777",
        dateOfBirth: "1995-07-30",
        gender: "OTHER",
        bloodGroup: "O-",
        emerContactName: "Sam Jordan",
        emerContactPhone: "+1 (555) 666-7778",
        totalEncounters: 2,
        predictionsCount: 1,
        status: "active",
        joinedAt: "2024-02-15T10:00:00Z",
        avatar: "A"
    },
    {
        id: "PAT-8046",
        fullName: "Thomas Anderson",
        email: "neo.matrix@company.com",
        phone: "+1 (555) 111-0000",
        dateOfBirth: "1982-03-24",
        gender: "MALE",
        bloodGroup: "A+",
        emerContactName: "Trinity Anderson",
        emerContactPhone: "+1 (555) 111-0001",
        totalEncounters: 0,
        predictionsCount: 0,
        status: "inactive",
        joinedAt: "2024-02-20T08:45:00Z",
        avatar: "T"
    }
];

// --- Helpers ---
const getAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
};

const genderColors = {
    MALE: "text-blue-600 bg-blue-50 border-blue-200",
    FEMALE: "text-pink-600 bg-pink-50 border-pink-200",
    OTHER: "text-purple-600 bg-purple-50 border-purple-200"
};

export default function ManagePatientsPage() {
    // --- State ---
    const [patients, setPatients] = useState<Patient[]>(mockPatients);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PatientStatus | "ALL">("ALL");
    const [genderFilter, setGenderFilter] = useState<string>("ALL");
    const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Derived distinct Blood Groups
    const uniqueBloodGroups = useMemo(() => {
        const groups = new Set(patients.map(p => p.bloodGroup));
        return Array.from(groups).sort();
    }, [patients]);

    // --- Actions ---
    const toggleStatus = (id: string, newStatus: PatientStatus) => {
        setPatients(patients.map(pat => {
            if (pat.id === id) {
                return { ...pat, status: newStatus };
            }
            return pat;
        }));
    };

    // --- Derived Data ---
    const filteredPatients = useMemo(() => {
        return patients.filter(pat => {
            const matchesSearch =
                pat.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pat.phone.includes(searchTerm);

            const matchesStatus = statusFilter === "ALL" || pat.status === statusFilter;
            const matchesGender = genderFilter === "ALL" || pat.gender === genderFilter;
            const matchesBloodGroup = bloodGroupFilter === "ALL" || pat.bloodGroup === bloodGroupFilter;

            return matchesSearch && matchesStatus && matchesGender && matchesBloodGroup;
        });
    }, [patients, searchTerm, statusFilter, genderFilter, bloodGroupFilter]);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const paginatedPatients = filteredPatients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, genderFilter, bloodGroupFilter]);

    // Aggregate Stats
    const totalPredictionsMade = patients.reduce((acc, p) => acc + p.predictionsCount, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Manage Patients</h1>
                    <p className="text-text-muted mt-1">View patient portfolios, medical history, and risk assessments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export Registry
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Patients", value: patients.length, icon: User, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Active Cohort", value: patients.filter(d => d.status === "active").length, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Total Encounters", value: patients.reduce((acc, p) => acc + p.totalEncounters, 0), icon: History, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Predictions Made", value: totalPredictionsMade, icon: Dna, color: "text-purple-500", bg: "bg-purple-50" },
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
                            placeholder="Search by name, ID, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || statusFilter !== "ALL" || genderFilter !== "ALL" || bloodGroupFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(statusFilter !== "ALL" || genderFilter !== "ALL" || bloodGroupFilter !== "ALL") && (
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
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as PatientStatus | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Gender</label>
                                    <select
                                        value={genderFilter}
                                        onChange={(e) => setGenderFilter(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Genders</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Blood Group</label>
                                    <select
                                        value={bloodGroupFilter}
                                        onChange={(e) => setBloodGroupFilter(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Blood Groups</option>
                                        {uniqueBloodGroups.map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(statusFilter !== "ALL" || genderFilter !== "ALL" || bloodGroupFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setStatusFilter("ALL");
                                                setGenderFilter("ALL");
                                                setBloodGroupFilter("ALL");
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

            {/* Patients Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-semibold">Patient Information</th>
                                <th className="px-6 py-4 font-semibold">Demographics</th>
                                <th className="px-6 py-4 font-semibold">Emergency Contact</th>
                                <th className="px-6 py-4 font-semibold">History Stats</th>
                                <th className="px-6 py-4 font-semibold">Status / Joined</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No patients found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPatients.map((pat) => (
                                        <motion.tr
                                            key={pat.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                        >
                                            {/* Patient Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {pat.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text-primary">{pat.fullName}</p>
                                                        <p className="text-xs text-text-muted font-mono">{pat.id}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                                                            <Mail className="w-3 h-3" />
                                                            {pat.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                                                            <Phone className="w-3 h-3" />
                                                            {pat.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Demographics */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${genderColors[pat.gender]}`}>
                                                            {pat.gender}
                                                        </span>
                                                        <span className="text-sm text-text-primary font-semibold">
                                                            {getAge(pat.dateOfBirth)} Yrs
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold">
                                                        <Droplet className="w-3.5 h-3.5 text-red-500" />
                                                        Blood: {pat.bloodGroup}
                                                    </div>
                                                    <div className="text-xs text-text-muted">
                                                        DOB: {format(new Date(pat.dateOfBirth), "MMM d, yyyy")}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Emergency Contact */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-text-primary">{pat.emerContactName}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                        <Phone className="w-3 h-3 text-text-secondary" />
                                                        {pat.emerContactPhone}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* History Stats */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary w-full justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <History className="w-3.5 h-3.5" />
                                                            Visits
                                                        </div>
                                                        <span className="font-bold text-text-primary">{pat.totalEncounters}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary w-full justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <Dna className="w-3.5 h-3.5 text-purple-500" />
                                                            AI Runs
                                                        </div>
                                                        <span className="font-bold text-text-primary">{pat.predictionsCount}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status & Date */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {pat.status === 'active' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-rose-500" />
                                                        )}
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${pat.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                                                            }`}>
                                                            {pat.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(pat.joinedAt), "MMM d, yyyy")}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {pat.status === 'active' && (
                                                        <button
                                                            onClick={() => toggleStatus(pat.id, 'inactive')}
                                                            className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                                            title="Deactivate Account"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {pat.status === 'inactive' && (
                                                        <button
                                                            onClick={() => toggleStatus(pat.id, 'active')}
                                                            className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                            title="Reactivate Account"
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors" title="View Portfolio">
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 rounded-lg bg-surface border border-border-light text-text-secondary hover:bg-border-light transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
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
                                {Math.min(currentPage * itemsPerPage, filteredPatients.length)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{filteredPatients.length}</span> patients
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
