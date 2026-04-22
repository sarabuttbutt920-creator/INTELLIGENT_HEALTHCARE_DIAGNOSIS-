"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    FileText,
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
        { label: "Medical Imaging", icon: FileImage, href: "/patient/files" },
        { label: "My Reports", icon: FileText, href: "/patient/reports" },
        { label: "Appointments", icon: Calendar, href: "/patient/appointments" },
        { label: "Chat", icon: MessageSquare, href: "/patient/chat" },
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

interface DoctorProfile {
    full_name: string;
    specialization: string;
    hospital_name?: string;
    profile_photo_url?: string;
    verification_status: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.includes("/admin");
    const isDoctor = pathname.includes("/doctor");
    const role: "ADMIN" | "DOCTOR" | "PATIENT" = isAdmin ? "ADMIN" : isDoctor ? "DOCTOR" : "PATIENT";
    const links = sidebarLinks[role];

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const router = useRouter();

    const [notifications, setNotifications] = useState<{ appointments: number; messages: number; activities: any[] }>({
        appointments: 0, messages: 0, activities: []
    });

    const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);

    // Fetch doctor profile for header
    useEffect(() => {
        if (role === 'DOCTOR') {
            fetch('/api/doctor/profile')
                .then(r => r.json())
                .then(d => {
                    if (d.success) {
                        setDoctorProfile({
                            full_name: d.data.user.full_name,
                            specialization: d.data.specialization,
                            hospital_name: d.data.hospital_name,
                            profile_photo_url: d.data.profile_photo_url,
                            verification_status: d.data.verification_status
                        });
                    }
                })
                .catch(() => {});
        }
    }, [role]);

    useEffect(() => {
        if (role !== 'ADMIN') {
            const fetchNotifs = async () => {
                try {
                    const res = await fetch('/api/notifications');
                    const data = await res.json();
                    if (data.success) {
                        setNotifications({
                            appointments: data.appointments || 0,
                            messages: data.messages || 0,
                            activities: data.activities || []
                        });
                    }
                } catch (e) { /* silent */ }
            };
            fetchNotifs();
            const id = setInterval(fetchNotifs, 30000);
            return () => clearInterval(id);
        }
    }, [role]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch { /* silent */ }
    };

    const displayName = role === 'DOCTOR' && doctorProfile
        ? `Dr. ${doctorProfile.full_name}`
        : role === 'PATIENT' ? 'Patient' : 'Admin';

    const displaySubtitle = role === 'DOCTOR' && doctorProfile
        ? doctorProfile.specialization
        : role.charAt(0) + role.slice(1).toLowerCase();

    const avatarInitial = role === 'DOCTOR' && doctorProfile
        ? doctorProfile.full_name.charAt(0).toUpperCase()
        : role.charAt(0);

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Sidebar - Desktop */}
            <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-border-light z-30 transition-all duration-300 hidden lg:block ${isSidebarOpen ? "w-64" : "w-20"}`}>
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
                                            : "text-text-secondary hover:bg-surface hover:text-text-primary"}`}
                                    >
                                        <link.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "group-hover:text-primary"}`} />
                                        {isSidebarOpen && <span className="text-sm flex-1">{link.label}</span>}

                                        {isSidebarOpen && link.label === "Appointments" && notifications.appointments > 0 && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                                {notifications.appointments}
                                            </span>
                                        )}
                                        {isSidebarOpen && link.label === "Chat" && notifications.messages > 0 && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                                {notifications.messages}
                                            </span>
                                        )}

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

                    {/* Doctor Mini Card at Bottom */}
                    {isSidebarOpen && role === 'DOCTOR' && doctorProfile && (
                        <div className="px-3 mb-3">
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {avatarInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-text-primary truncate">Dr. {doctorProfile.full_name}</p>
                                        <p className="text-[10px] text-text-muted truncate">{doctorProfile.specialization}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-3">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-500 transition-all duration-200 group ${!isSidebarOpen && "justify-center"}`}
                        >
                            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            {isSidebarOpen && <span className="text-sm font-medium">Log out</span>}
                        </button>

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mt-4 w-full flex items-center justify-center p-2 rounded-lg bg-surface hover:bg-border-light transition-colors"
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
                <header className="hidden lg:flex sticky top-0 h-20 bg-white/90 backdrop-blur-md border-b border-border-light z-20 px-8 items-center justify-between shadow-sm">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search patients, records, reports..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border-light focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isNotifOpen ? 'bg-primary/10 text-primary' : 'bg-surface text-text-secondary hover:bg-border-light'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {(notifications.appointments > 0 || notifications.messages > 0) && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[8px] font-bold text-white shadow-sm">
                                        {notifications.appointments + notifications.messages}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-14 w-80 bg-white rounded-2xl border border-border-light shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-border-light flex items-center justify-between bg-surface/50">
                                            <h3 className="font-bold text-text-primary text-sm">Activity Notifications</h3>
                                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{notifications.activities.length} New</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto p-2">
                                            {notifications.activities.length === 0 ? (
                                                <div className="py-8 text-center text-text-muted flex flex-col items-center">
                                                    <Bell className="w-8 h-8 opacity-20 mb-2" />
                                                    <p className="text-sm">All caught up!</p>
                                                </div>
                                            ) : (
                                                notifications.activities.map((act) => (
                                                    <div key={act.id} className="p-3 mb-1 hover:bg-surface rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border-light group">
                                                        <div className="flex gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.type === 'APPOINTMENT' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                {act.type === 'APPOINTMENT' ? <Calendar className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{act.title}</p>
                                                                <p className="text-xs text-text-secondary leading-snug mt-0.5">{act.message}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-border-light" />

                        {/* Doctor/User Info Block */}
                        <Link href={role === 'DOCTOR' ? '/doctor/profile' : '#'} className="flex items-center gap-3 group">
                            <div className="text-right">
                                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                                    {displayName}
                                </p>
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider truncate max-w-[160px]">
                                    {displaySubtitle}
                                </p>
                            </div>

                            {doctorProfile?.profile_photo_url ? (
                                <img
                                    src={doctorProfile.profile_photo_url}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl gradient-primary border-2 border-white flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-shadow">
                                    {avatarInitial}
                                </div>
                            )}

                            {role === 'DOCTOR' && doctorProfile?.verification_status === 'APPROVED' && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500 absolute ml-8 mt-6" title="Verified Doctor" />
                            )}
                        </Link>
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

                            {role === 'DOCTOR' && doctorProfile && (
                                <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
                                            {avatarInitial}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary">Dr. {doctorProfile.full_name}</p>
                                            <p className="text-xs text-primary font-semibold">{doctorProfile.specialization}</p>
                                            {doctorProfile.hospital_name && (
                                                <p className="text-[10px] text-text-muted">{doctorProfile.hospital_name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className="space-y-1">
                                {links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface hover:text-primary transition-all"
                                    >
                                        <link.icon className="w-5 h-5 shrink-0" />
                                        <span className="text-sm font-medium flex-1">{link.label}</span>
                                        {link.label === "Appointments" && notifications.appointments > 0 && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                                {notifications.appointments}
                                            </span>
                                        )}
                                        {link.label === "Chat" && notifications.messages > 0 && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                                {notifications.messages}
                                            </span>
                                        )}
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
