"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    MoreVertical,
    UserX,
    UserCheck,
    Shield,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Activity,
    CheckCircle2,
    XCircle,
    Download,
    Users
} from "lucide-react";
import { format } from "date-fns";

// --- Types ---
type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
type UserStatus = "active" | "inactive";

interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    joinedAt: string;
    lastLogin: string;
    avatar?: string;
}

// --- Mock Data ---
const mockUsers: User[] = [
    {
        id: "USR-001",
        fullName: "Dr. Sarah Jenkins",
        email: "sarah.j@mediintel.com",
        phone: "+1 (555) 123-4567",
        role: "DOCTOR",
        status: "active",
        joinedAt: "2023-11-15T08:30:00Z",
        lastLogin: "2024-02-20T14:45:00Z",
        avatar: "S"
    },
    {
        id: "USR-002",
        fullName: "Michael Chen",
        email: "m.chen88@gmail.com",
        phone: "+1 (555) 987-6543",
        role: "PATIENT",
        status: "active",
        joinedAt: "2024-01-10T11:20:00Z",
        lastLogin: "2024-02-25T09:15:00Z",
        avatar: "M"
    },
    {
        id: "USR-003",
        fullName: "Admin System",
        email: "admin@mediintel.com",
        phone: "+1 (555) 000-0000",
        role: "ADMIN",
        status: "active",
        joinedAt: "2023-10-01T00:00:00Z",
        lastLogin: "2024-02-25T23:30:00Z",
        avatar: "A"
    },
    {
        id: "USR-004",
        fullName: "Emily Rodriguez",
        email: "emily.rod@outlook.com",
        phone: "+1 (555) 456-7890",
        role: "PATIENT",
        status: "inactive",
        joinedAt: "2023-12-05T16:00:00Z",
        lastLogin: "2024-01-15T10:20:00Z",
        avatar: "E"
    },
    {
        id: "USR-005",
        fullName: "Dr. James Wilson",
        email: "james.wilson@mediintel.com",
        phone: "+1 (555) 321-0987",
        role: "DOCTOR",
        status: "active",
        joinedAt: "2023-11-20T09:00:00Z",
        lastLogin: "2024-02-24T18:30:00Z",
        avatar: "J"
    },
    {
        id: "USR-006",
        fullName: "Lisa Thompson",
        email: "lisa.thompson@hotmail.com",
        phone: "+1 (555) 789-0123",
        role: "PATIENT",
        status: "active",
        joinedAt: "2024-02-01T14:15:00Z",
        lastLogin: "2024-02-25T11:45:00Z",
        avatar: "L"
    }
];

// --- Helpers ---
const roleColors = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    DOCTOR: "bg-blue-100 text-blue-700 border-blue-200",
    PATIENT: "bg-emerald-100 text-emerald-700 border-emerald-200"
};

const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-rose-100 text-rose-700"
};

export default function ManageUsersPage() {
    // --- State ---
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    // --- Actions ---
    const toggleUserStatus = (id: string) => {
        setUsers(users.map(user => {
            if (user.id === id) {
                return {
                    ...user,
                    status: user.status === "active" ? "inactive" : "active"
                };
            }
            return user;
        }));
    };

    // --- Derived Data ---
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
            const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);


    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Manage Users</h1>
                    <p className="text-text-muted mt-1">View, filter, and manage system users across all roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Shield className="w-4 h-4" />
                        Add Admin
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Active Doctors", value: users.filter(u => u.role === "DOCTOR" && u.status === "active").length, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Total Patients", value: users.filter(u => u.role === "PATIENT").length, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Inactive Accounts", value: users.filter(u => u.status === "inactive").length, icon: UserX, color: "text-rose-500", bg: "bg-rose-50" },
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
                            placeholder="Search by name, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || roleFilter !== "ALL" || statusFilter !== "ALL"
                                ? "bg-primary/5 border-primary/20 text-primary"
                                : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(roleFilter !== "ALL" || statusFilter !== "ALL") && (
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
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Role</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Roles</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="PATIENT">Patient</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as UserStatus | "ALL")}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    {(roleFilter !== "ALL" || statusFilter !== "ALL") && (
                                        <button
                                            onClick={() => {
                                                setRoleFilter("ALL");
                                                setStatusFilter("ALL");
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

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border-light text-text-secondary text-sm">
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Contact</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Joined / Last Login</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No users found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                        >
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {user.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text-primary">{user.fullName}</p>
                                                        <p className="text-xs text-text-muted font-mono">{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Contact */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {user.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Role */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${roleColors[user.role]}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {user.status === 'active' ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-rose-500" />
                                                    )}
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${user.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Dates */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                        Joined {format(new Date(user.joinedAt), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-text-muted pl-5.5">
                                                        Last online: {format(new Date(user.lastLogin), "MMM d, HH:mm")}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id)}
                                                        className={`p-2 rounded-lg transition-colors border ${user.status === 'active'
                                                            ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                                                            : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        title={user.status === 'active' ? "Deactivate User" : "Activate User"}
                                                    >
                                                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
                            Showing <span className="font-semibold text-text-primary">{(currentPage - 1) * usersPerPage + 1}</span> to{" "}
                            <span className="font-semibold text-text-primary">
                                {Math.min(currentPage * usersPerPage, filteredUsers.length)}
                            </span>{" "}
                            of <span className="font-semibold text-text-primary">{filteredUsers.length}</span> entries
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
