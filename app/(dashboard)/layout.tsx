"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronRight,
    Activity,
    Menu,
    X,
    ClipboardList,
    Calendar,
    Stethoscope,
    User,
    MessageSquare,
    Upload,
    Star,
    PieChart,
    History,
    FileImage
} from "lucide-react";

const sidebarLinks = {
    ADMIN: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
        { label: "Manage Users", icon: Users, href: "/admin/users" },
        { label: "Manage Doctors", icon: Stethoscope, href: "/admin/doctors" },
        { label: "Manage Patients", icon: Activity, href: "/admin/patients" },
        { label: "Predictions Overview", icon: Activity, href: "/admin/predictions" },
        { label: "Reports Overview", icon: FileText, href: "/admin/reports" },
        { label: "Appointments Monitoring", icon: Calendar, href: "/admin/appointments" },
        { label: "System Analytics", icon: PieChart, href: "/admin/analytics" },
        { label: "Visitor Logs", icon: ClipboardList, href: "/admin/logs" },
    ],
    PATIENT: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/patient" },
        { label: "My Profile", icon: User, href: "/patient/profile" },
        { label: "New Prediction", icon: Activity, href: "/patient/prediction" },
        { label: "My Reports", icon: FileText, href: "/patient/reports" },
        { label: "Appointments", icon: Calendar, href: "/patient/appointments" },
        { label: "Chat", icon: MessageSquare, href: "/patient/chat" },
        { label: "Upload Medical Files", icon: Upload, href: "/patient/files" },
        { label: "Medical History", icon: History, href: "/patient/history" },
    ],
    DOCTOR: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/doctor" },
        { label: "My Profile", icon: User, href: "/doctor/profile" },
        { label: "Appointments", icon: Calendar, href: "/doctor/appointments" },
        { label: "My Patients", icon: Users, href: "/doctor/patients" },
        { label: "Patient Encounters", icon: ClipboardList, href: "/doctor/encounters" },
        { label: "Add Clinical Notes", icon: FileText, href: "/doctor/notes" },
        { label: "Chat", icon: MessageSquare, href: "/doctor/chat" },
        { label: "Reviews", icon: Star, href: "/doctor/reviews" },
    ]
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdmin = pathname.includes("/admin");
    const isDoctor = pathname.includes("/doctor");
    const role: "ADMIN" | "DOCTOR" | "PATIENT" = isAdmin ? "ADMIN" : isDoctor ? "DOCTOR" : "PATIENT";
    const links = sidebarLinks[role];

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Sidebar - Desktop */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-white border-r border-border-light z-30 transition-all duration-300 hidden lg:block ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                <div className="h-full flex flex-col justify-between py-6">
                    <div>
                        {/* Logo */}
                        <div className={`px-6 mb-10 flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}>
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            {isSidebarOpen && (
                                <span className="text-xl font-bold tracking-tight text-text-primary">
                                    IH<span className="gradient-text">DS</span>
                                </span>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <nav className="px-3 space-y-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                                            }`}
                                    >
                                        <link.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "group-hover:text-primary"}`} />
                                        {isSidebarOpen && <span className="text-sm">{link.label}</span>}
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Sidebar Content */}
                    <div className="px-3">
                        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-500 transition-all duration-200 group ${!isSidebarOpen && "justify-center"}`}>
                            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            {isSidebarOpen && <span className="text-sm font-medium">Log out</span>}
                        </button>

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mt-6 w-full flex items-center justify-center p-2 rounded-lg bg-surface hover:bg-border-light transition-colors"
                        >
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border-light z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    <span className="font-bold">IHDS</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-surface">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </header>

            {/* Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
                {/* Desktop Top Header */}
                <header className="hidden lg:flex sticky top-0 h-20 bg-white/80 backdrop-blur-md border-b border-border-light z-20 px-8 items-center justify-between">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search patients, results..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative w-10 h-10 rounded-xl bg-surface flex items-center justify-center hover:bg-border-light transition-colors">
                            <Bell className="w-5 h-5 text-text-secondary" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-border-light mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-text-primary capitalize">{role.toLowerCase()} User</p>
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl gradient-primary border-2 border-white flex items-center justify-center text-white font-bold">
                                {role[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 sm:p-8 mt-16 lg:mt-0">
                    {children}
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            className="w-72 h-full bg-white p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">IHDS</span>
                            </div>
                            <nav className="space-y-1">
                                {links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface hover:text-primary transition-all"
                                    >
                                        <link.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{link.label}</span>
                                    </Link>
                                ))}
                            </nav>
                            <div className="absolute bottom-6 left-6 right-6">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
