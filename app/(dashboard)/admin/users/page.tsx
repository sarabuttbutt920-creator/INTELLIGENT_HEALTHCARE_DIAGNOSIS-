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
    Users,
    Trash2,
    Edit,
    Plus
} from "lucide-react";
import { format } from "date-fns";
import AddAdminModal from "./AddAdminModal";
import EditUserModal from "./EditUserModal";

// --- Types ---
type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
type UserStatus = "active" | "inactive";

interface User {
    user_id: string | number;
    full_name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    last_login_at: string | null;
}

// --- Helpers ---
const roleColors = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    DOCTOR: "bg-blue-100 text-blue-700 border-blue-200",
    PATIENT: "bg-emerald-100 text-emerald-700 border-emerald-200"
};

export default function ManageUsersPage() {
    // --- State ---
    const [users, setUsers] = useState<User[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, activeDoctors: 0, totalPatients: 0, inactiveAccounts: 0 });

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    // --- Data Fetching ---
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(usersPerPage),
                search: searchTerm,
                role: roleFilter,
                status: statusFilter
            });
            const res = await fetch(`/api/admin/users?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalItems(data.totalCount);
            }
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/users/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats");
        }
    };

    // Load initial data and on dependency changes
    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [currentPage, searchTerm, roleFilter, statusFilter]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);

    // --- Actions ---
    const toggleUserStatus = async (user: User) => {
        try {
            const newStatus = !user.is_active;
            const res = await fetch(`/api/admin/users/${user.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: newStatus }),
            });
            if (res.ok) {
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            console.error("Failed to update status");
        }
    };

    const deleteUser = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchUsers();
                fetchStats();
            } else {
                alert("Failed to delete user. They might be tied to existing records.");
            }
        } catch (error) {
            console.error("Failed to delete user");
        }
    };

    const exportCsv = () => {
        const headers = ["ID", "Full Name", "Email", "Phone", "Role", "Status", "Joined At"];
        const csvRows = [headers.join(",")];

        users.forEach(user => {
            const row = [
                user.user_id,
                `"${user.full_name}"`,
                user.email,
                user.phone || "N/A",
                user.role,
                user.is_active ? "Active" : "Inactive",
                new Date(user.created_at).toISOString().split("T")[0]
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(totalItems / usersPerPage);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Manage Users</h1>
                    <p className="text-text-muted mt-1">View, filter, and manage system users across all roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:bg-surface transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <Shield className="w-4 h-4" />
                        Add Admin
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Active Doctors", value: stats.activeDoctors, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Inactive Accounts", value: stats.inactiveAccounts, icon: UserX, color: "text-rose-500", bg: "bg-rose-50" },
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
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden min-h-[400px]">
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                            <p className="font-medium text-lg text-text-secondary">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg text-text-secondary">No users found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <motion.tr
                                            key={user.user_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors group"
                                        >
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {user.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text-primary">{user.full_name}</p>
                                                        <p className="text-xs text-text-muted font-mono">{user.user_id}</p>
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
                                                        {user.phone || "N/A"}
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
                                                    {user.is_active ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-rose-500" />
                                                    )}
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${user.is_active ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}>
                                                        {user.is_active ? "ACTIVE" : "INACTIVE"}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Dates */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                        Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-text-muted pl-5.5">
                                                        Last online: {user.last_login_at ? format(new Date(user.last_login_at), "MMM d, HH:mm") : "Never"}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => toggleUserStatus(user)}
                                                        className={`p-2 rounded-lg transition-colors border ${user.is_active
                                                            ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                                                            : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        title={user.is_active ? "Deactivate User" : "Activate User"}
                                                    >
                                                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>

                                                    <button
                                                        className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        title="View User"
                                                        onClick={() => alert(`View details for ${user.full_name}`)}
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 transition-colors"
                                                        title="Edit User"
                                                        onClick={() => {
                                                            setUserToEdit(user);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => deleteUser(user.user_id)}
                                                        className="p-2 rounded-lg bg-surface border border-border-light text-rose-500 hover:bg-rose-50 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                            Showing <span className="font-semibold text-text-primary">{(currentPage - 1) * usersPerPage + (totalItems > 0 ? 1 : 0)}</span> to{" "}
                            <span className="font-semibold text-text-primary">
                                {Math.min(currentPage * usersPerPage, totalItems)}
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

            <AddAdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchUsers();
                    fetchStats();
                    alert("Admin added successfully!");
                }}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setUserToEdit(null);
                }}
                userToEdit={userToEdit}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    setUserToEdit(null);
                    fetchUsers();
                    fetchStats();
                    alert("User updated successfully!");
                }}
            />
        </div>
    );
}
