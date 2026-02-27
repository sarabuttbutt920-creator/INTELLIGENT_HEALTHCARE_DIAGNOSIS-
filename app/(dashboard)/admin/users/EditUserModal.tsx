import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Mail, Phone, User, Loader2 } from "lucide-react";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit: any | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, userToEdit }: EditUserModalProps) {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "PATIENT",
        is_active: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Pre-fill form when the user to edit changes
    useEffect(() => {
        if (userToEdit) {
            setFormData({
                full_name: userToEdit.full_name || "",
                email: userToEdit.email || "",
                phone: userToEdit.phone || "",
                role: userToEdit.role || "PATIENT",
                is_active: userToEdit.is_active ?? true,
            });
        }
    }, [userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/users/${userToEdit.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update user");

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border-light overflow-hidden z-10 m-4"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border-light flex items-center justify-between bg-surface/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-text-primary">Edit User</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text-secondary">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        name="full_name"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text-secondary">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text-secondary">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-text-secondary">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full p-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="PATIENT">Patient</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-text-secondary">Status</label>
                                    <div className="flex items-center h-[42px]">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-sm text-text-primary">
                                                {formData.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
