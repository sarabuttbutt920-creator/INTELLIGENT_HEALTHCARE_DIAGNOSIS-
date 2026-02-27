"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Camera, Mail, Phone, MapPin, Building2, Stethoscope, Award, FileText, CheckCircle2, ShieldAlert,
    Clock, Calendar, Globe, AlertCircle, ShieldCheck
} from "lucide-react";

export default function DoctorProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: "", email: "", phone: "", gender: "", date_of_birth: "", nationality: "", profile_photo_url: "",
        clinic_address: "", hospital_name: "", consultation_hours: "", license_no: "", license_expiry_date: "",
        license_cert_url: "", degree: "", university_name: "", graduation_year: "", degree_cert_url: "",
        specialization: "", sub_specialty: "", experience_years: "", professional_memberships: "", govt_id_url: "",
        bio: "", fee: "",
        verification_status: "DRAFT"
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/doctor/profile");
                const { data } = await res.json();
                if (data) {
                    setFormData({
                        ...formData,
                        full_name: data.user?.full_name || "",
                        email: data.user?.email || "",
                        phone: data.user?.phone || "",
                        gender: data.gender || "",
                        date_of_birth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
                        nationality: data.nationality || "",
                        profile_photo_url: data.profile_photo_url || "",
                        clinic_address: data.clinic_address || "",
                        hospital_name: data.hospital_name || "",
                        consultation_hours: data.consultation_hours || "",
                        license_no: data.license_no || "",
                        license_expiry_date: data.license_expiry_date ? data.license_expiry_date.split("T")[0] : "",
                        license_cert_url: data.license_cert_url || "",
                        degree: data.degree || "",
                        university_name: data.university_name || "",
                        graduation_year: data.graduation_year?.toString() || "",
                        degree_cert_url: data.degree_cert_url || "",
                        specialization: data.specialization || "",
                        sub_specialty: data.sub_specialty || "",
                        experience_years: data.experience_years?.toString() || "",
                        professional_memberships: data.professional_memberships || "",
                        govt_id_url: data.govt_id_url || "",
                        bio: data.bio || "",
                        fee: data.fee?.toString() || "",
                        verification_status: data.verification_status || "DRAFT"
                    });
                }
            } catch (error) {
                console.error("Failed to load generic profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (fieldName: string) => {
        // Simulating highly secure file upload
        const fakeUrl = `https://medi-intel-storage.s3.demo/uploads/${Math.floor(Math.random() * 99999)}_${fieldName}.pdf`;
        setFormData(prev => ({ ...prev, [fieldName]: fakeUrl }));
        alert(`${fieldName.replace('_url', '')} securely uploaded!`);
    }

    const handleSave = async (submitForReview = false) => {
        setIsSaving(true);
        setSubmitStatus(null);
        try {
            const payload = { ...formData, action: submitForReview ? "SUBMIT_FOR_REVIEW" : "SAVE_DRAFT" };
            const res = await fetch("/api/doctor/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitStatus(submitForReview ? "Profile submitted for Admin verification!" : "Draft secured successfully.");
                if (submitForReview) setFormData(prev => ({ ...prev, verification_status: "SUBMITTED" }));
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network error. Please try again.");
        } finally {
            setTimeout(() => { setIsSaving(false); setSubmitStatus(null); }, 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const isPending = ["SUBMITTED", "UNDER_REVIEW"].includes(formData.verification_status);
    const isApproved = formData.verification_status === "APPROVED";
    const isSuspended = formData.verification_status === "SUSPENDED" || formData.verification_status === "REJECTED";

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Professional Profile</h1>
                    <p className="text-text-muted mt-2 max-w-xl">Complete your medical profile to gain full platform privileges and verification access into the Medi-Intel ecosystem.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className={`px-4 py-2 border rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 ${isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        isPending ? "bg-amber-50 text-amber-600 border-amber-200" :
                            isSuspended ? "bg-rose-50 text-rose-600 border-rose-200" :
                                "bg-surface text-text-secondary border-border-light"
                        }`}>
                        {isApproved ? <CheckCircle2 className="w-4 h-4" /> :
                            isPending ? <Clock className="w-4 h-4" /> :
                                isSuspended ? <ShieldAlert className="w-4 h-4" /> :
                                    <AlertCircle className="w-4 h-4" />}
                        {formData.verification_status.replace("_", " ")}
                    </div>

                    {!isPending && !isSuspended && (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-white border border-border-light rounded-xl font-semibold text-text-secondary hover:bg-surface transition-colors"
                            >
                                {isSaving ? "Saving..." : isApproved ? "Save Changes" : "Save Draft"}
                            </button>
                            {!isApproved && (
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    Submit for Verification
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {submitStatus && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-semibold">{submitStatus}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">

                {/* Left Column: Essential Contact */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white rounded-3xl border border-border-light p-8 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/10 to-indigo-500/5" />

                        <div className="relative z-10 mx-auto w-32 h-32 rounded-3xl bg-surface border-4 border-white shadow-xl flex items-center justify-center overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-500">
                            {formData.profile_photo_url ? (
                                <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-primary/40" />
                            )}
                            {(!isPending && !isSuspended) && (
                                <button type="button" onClick={() => handleFileUpload("profile_photo_url")} className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-text-primary">{formData.full_name || "Doctor Name"}</h2>
                        <p className="text-sm text-primary font-semibold mb-6">{formData.specialization || "General Practice"}</p>
                        {formData.bio && (
                            <p className="text-xs text-text-secondary leading-relaxed mb-6 italic border-l-2 border-primary/30 pl-3 text-left">
                                "{formData.bio.length > 100 ? formData.bio.substring(0, 100) + "..." : formData.bio}"
                            </p>
                        )}

                        <div className="space-y-4 text-left border-t border-border-light pt-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Verified Email</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl text-sm font-medium text-text-secondary border border-transparent">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    {formData.email}
                                </div>
                            </div>
                            <InputField label="Phone Number" icon={<Phone />} name="phone" value={formData.phone} onChange={handleChange} disabled={isPending || isSuspended} />
                            <InputField label="Government ID (CNIC/Passport)" type="text" icon={<Award />} name="govt_id_url" value={formData.govt_id_url} onChange={handleChange} disabled={isPending || isSuspended} placeholder="Paste link or strictly upload" />
                            {(!isPending && !isSuspended) && (
                                <button type="button" onClick={() => handleFileUpload("govt_id_url")} className="!mt-2 w-full py-2 border-2 border-dashed border-primary/20 text-primary font-semibold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                                    Upload ID Document
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Personal Information */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-border-light p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border-light pb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><User className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-text-primary">Personal Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Full Legal Name" name="full_name" value={formData.full_name} onChange={handleChange} disabled={isPending || isSuspended} />
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} disabled={isPending || isSuspended} className="w-full px-4 py-3 bg-surface border border-border-light rounded-xl text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60">
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <InputField label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={isPending || isSuspended} />
                            <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} disabled={isPending || isSuspended} icon={<Globe />} />
                        </div>
                    </motion.div>

                    {/* Professional Credentials */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl border border-border-light p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border-light pb-4">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Award className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-text-primary">Academic & Licenses</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Primary Degree (e.g., MBBS, MD)" name="degree" value={formData.degree} onChange={handleChange} disabled={isPending || isSuspended} />
                            <InputField label="University / Medical College" name="university_name" value={formData.university_name} onChange={handleChange} disabled={isPending || isSuspended} />
                            <InputField label="Graduation Year" type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} disabled={isPending || isSuspended} />

                            <div className="flex flex-col justify-end">
                                {(!isPending && !isSuspended) ? (
                                    <button type="button" onClick={() => handleFileUpload("degree_cert_url")} className="h-[46px] w-full border-2 border-dashed border-primary/20 text-primary font-semibold rounded-xl text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" /> {formData.degree_cert_url ? "Degree Attached" : "Upload Degree Cert"}
                                    </button>
                                ) : formData.degree_cert_url ? (
                                    <div className="h-[46px] flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Degree Proof Lodged</div>
                                ) : null}
                            </div>

                            <InputField label="Medical License Number" name="license_no" value={formData.license_no} onChange={handleChange} disabled={isPending || isSuspended} icon={<ShieldCheck />} />
                            <InputField label="License Expiry Date" type="date" name="license_expiry_date" value={formData.license_expiry_date} onChange={handleChange} disabled={isPending || isSuspended} />

                            <div className="md:col-span-2 flex flex-col justify-end">
                                {(!isPending && !isSuspended) ? (
                                    <button type="button" onClick={() => handleFileUpload("license_cert_url")} className="h-[46px] w-full border-2 border-dashed border-rose-500/20 text-rose-600 font-semibold rounded-xl text-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" /> {formData.license_cert_url ? "License Lodged" : "Upload License Certificate"}
                                    </button>
                                ) : formData.license_cert_url ? (
                                    <div className="h-[46px] flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> License Proof Submitted</div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>

                    {/* Medical Practice Details */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl border border-border-light p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border-light pb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Stethoscope className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-text-primary">Practice Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Primary Specialization" name="specialization" value={formData.specialization} onChange={handleChange} disabled={isPending || isSuspended} placeholder="e.g. Nephrology" />
                            <InputField label="Sub-Specialty" name="sub_specialty" value={formData.sub_specialty} onChange={handleChange} disabled={isPending || isSuspended} placeholder="e.g. Pediatric Nephrology" />
                            <InputField label="Years of Experience" type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} disabled={isPending || isSuspended} />
                            <InputField label="Consultation Fee ($)" type="number" name="fee" value={formData.fee} onChange={handleChange} disabled={isPending || isSuspended} icon={<Award />} placeholder="e.g. 150" />

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Consultation Hours (Availability)</label>
                                <ScheduleSelector
                                    value={formData.consultation_hours}
                                    onChange={(val: string) => setFormData(p => ({ ...p, consultation_hours: val }))}
                                    disabled={isPending || isSuspended}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField label="Current Clinic / Hospital Name" name="hospital_name" value={formData.hospital_name} onChange={handleChange} disabled={isPending || isSuspended} icon={<Building2 />} />
                            </div>
                            <div className="md:col-span-2">
                                <InputField label="Full Clinic Address" name="clinic_address" value={formData.clinic_address} onChange={handleChange} disabled={isPending || isSuspended} icon={<MapPin />} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">Professional Memberships</label>
                                <textarea name="professional_memberships" value={formData.professional_memberships} onChange={handleChange} disabled={isPending || isSuspended} rows={2} placeholder="List professional boards, associations, or memberships..." className="w-full px-4 py-3 bg-surface border border-border-light rounded-xl text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60 resize-none transition-colors" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">Professional Biography</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} disabled={isPending || isSuspended} rows={4} placeholder="Write a short engaging bio for patients to read..." className="w-full px-4 py-3 bg-white border border-border-light rounded-xl text-sm focus:border-primary outline-none disabled:opacity-60 resize-none transition-colors shadow-inner" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Reusable Input Wrapper
function InputField({ label, name, value, onChange, type = "text", disabled = false, placeholder = "", icon = null }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">{label}</label>
            <div className="relative group">
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted [&>svg]:w-4 [&>svg]:h-4 group-focus-within:text-primary transition-colors">{icon}</div>}
                <input
                    type={type}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-surface border border-border-light rounded-xl text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60 transition-colors`}
                />
            </div>
        </div>
    );
}

// Schedule Selector Component
function ScheduleSelector({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    // Parse the value carefully
    let initSchedule: any = [];
    try {
        if (value && value.startsWith("[")) initSchedule = JSON.parse(value);
    } catch (e) { }

    const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const [schedule, setSchedule] = useState<{ day: string, active: boolean, start: string, end: string }[]>(
        initSchedule.length === 7 ? initSchedule : daysList.map(d => ({ day: d, active: false, start: '09:00', end: '17:00' }))
    );

    const updateDay = (index: number, changes: any) => {
        if (disabled) return;
        const newSched = [...schedule];
        newSched[index] = { ...newSched[index], ...changes };
        setSchedule(newSched);
        onChange(JSON.stringify(newSched));
    };

    return (
        <div className="border border-border-light bg-white rounded-xl overflow-hidden divide-y divide-border-light shadow-sm">
            {schedule.map((slot, i) => (
                <div key={slot.day} className={`flex items-center justify-between p-3 gap-4 transition-colors ${slot.active ? 'bg-indigo-50/30' : 'bg-surface/50'}`}>
                    <label className="flex items-center gap-3 w-28 cursor-pointer select-none">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-60"
                            checked={slot.active}
                            onChange={(e) => updateDay(i, { active: e.target.checked })}
                            disabled={disabled}
                        />
                        <span className={`font-semibold text-sm ${slot.active ? 'text-primary' : 'text-text-muted'}`}>{slot.day}</span>
                    </label>

                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative group flex-1">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none transition-colors" />
                            <input type="time" value={slot.start} disabled={!slot.active || disabled} onChange={(e) => updateDay(i, { start: e.target.value })}
                                className="w-full pl-8 pr-2 py-2 text-sm bg-surface border border-border-light rounded-lg outline-none focus:border-primary disabled:opacity-40 transition-colors" />
                        </div>
                        <span className="text-text-muted text-xs font-bold">TO</span>
                        <div className="relative group flex-1">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none transition-colors" />
                            <input type="time" value={slot.end} disabled={!slot.active || disabled} onChange={(e) => updateDay(i, { end: e.target.value })}
                                className="w-full pl-8 pr-2 py-2 text-sm bg-surface border border-border-light rounded-lg outline-none focus:border-primary disabled:opacity-40 transition-colors" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
