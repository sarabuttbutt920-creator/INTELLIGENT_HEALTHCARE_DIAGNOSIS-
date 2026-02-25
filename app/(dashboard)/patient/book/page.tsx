"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Video,
    UserCircle,
    CheckCircle2,
    ChevronRight,
    Search,
    Stethoscope,
    Phone,
    FileText,
    ArrowLeft,
    Activity,
    BrainCircuit,
    HeartPulse,
    Eye,
    Shield
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";

// --- Types ---
type BookingStep = 1 | 2 | 3 | 4;
type VisitType = "CLINIC" | "TELEHEALTH";

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    avatar: string;
    availableTimes: string[];
}

// --- Mock Data ---
const specialties = [
    { id: "sp-1", name: "Nephrology Dept.", icon: Activity, desc: "Kidney specialists & AI diagnostics" },
    { id: "sp-2", name: "Cardiology Dept.", icon: HeartPulse, desc: "Heart health & blood pressure" },
    { id: "sp-3", name: "General Practice", icon: Stethoscope, desc: "Primary care & routine exams" },
    { id: "sp-4", name: "Neurology Dept.", icon: BrainCircuit, desc: "Brain, spine & nervous system" },
    { id: "sp-5", name: "Optometry Dept.", icon: Eye, desc: "Vision & eye care checkups" },
];

const mockDoctors: Doctor[] = [
    { id: "DOC-102", name: "Dr. Sarah Jenkins", specialty: "Nephrology Dept.", rating: 4.9, avatar: "SJ", availableTimes: ["09:00 AM", "10:30 AM", "01:00 PM", "03:45 PM"] },
    { id: "DOC-105", name: "Dr. Marcus Vance", specialty: "General Practice", rating: 4.8, avatar: "MV", availableTimes: ["08:15 AM", "11:00 AM", "02:30 PM", "04:00 PM"] },
    { id: "DOC-108", name: "Dr. Emily Chen", specialty: "Cardiology Dept.", rating: 5.0, avatar: "EC", availableTimes: ["09:30 AM", "01:15 PM", "03:00 PM"] },
    { id: "DOC-110", name: "Dr. Robert Singh", specialty: "Nephrology Dept.", rating: 4.7, avatar: "RS", availableTimes: ["10:00 AM", "12:00 PM", "04:30 PM"] },
];

// Generate consecutive dates starting from today
const getNextDays = (numDays: number) => {
    const today = startOfToday();
    return Array.from({ length: numDays }, (_, i) => addDays(today, i));
};

export default function BookAppointmentPage() {
    // --- State ---
    const [step, setStep] = useState<BookingStep>(1);

    // Booking Form State
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [visitType, setVisitType] = useState<VisitType>("TELEHEALTH");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState("");

    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // --- Derived Data ---
    const availableDoctors = mockDoctors.filter(d => d.specialty === selectedSpecialty);
    const upcomingDates = getNextDays(14); // Next 14 days

    // --- Handlers ---
    const handleNext = () => setStep(prev => Math.min(prev + 1, 4) as BookingStep);
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1) as BookingStep);

    const handleSpecialtySelect = (name: string) => {
        setSelectedSpecialty(name);
        setSelectedDoctor(null); // Reset doctor
        handleNext();
    };

    const handleDoctorSelect = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        handleNext(); // Move straight to date/time
    };

    const handleDateTimeSelect = (date: Date, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
        handleNext();
    };

    const handleConfirmBooking = () => {
        setIsConfirming(true);
        // Simulate API delay
        setTimeout(() => {
            setIsConfirming(false);
            setIsConfirmed(true);
        }, 2000);
    };

    // --- Animations ---
    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    if (isConfirmed) {
        return (
            <div className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200"
                >
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-text-primary mb-2"
                >
                    Appointment Confirmed!
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-text-secondary mb-8 max-w-lg"
                >
                    Your {visitType.toLowerCase()} session with {selectedDoctor?.name} has been securely scheduled.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full bg-white rounded-3xl border border-border-light shadow-sm p-6 sm:p-8 text-left space-y-6 mb-8"
                >
                    <div className="flex items-center gap-4 pb-6 border-b border-border-light">
                        <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                            {selectedDoctor?.avatar}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-primary">{selectedDoctor?.name}</h3>
                            <p className="font-medium text-text-secondary">{selectedDoctor?.specialty}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Date & Time</p>
                            <p className="font-bold text-text-primary">{selectedDate && format(selectedDate, "MMM d, yyyy")} at {selectedTime}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Visit Format</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs rounded-lg uppercase tracking-widest ${visitType === 'TELEHEALTH' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {visitType === 'TELEHEALTH' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {visitType}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-4">
                    <button onClick={() => window.location.href = '/patient/appointments'} className="px-6 py-3 rounded-xl border border-border-light bg-white text-text-secondary font-bold hover:bg-slate-50 transition-colors shadow-sm">
                        View Schedule
                    </button>
                    <button className="px-6 py-3 rounded-xl gradient-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                        Sync to Calendar
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <div className="text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">Book a Clinician</h1>
                <p className="text-text-muted mt-1">Schedule a specialist consultation via telehealth or in-person visit.</p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm mb-6 flex justify-between items-center relative z-10">
                {/* Connecting Line */}
                <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full gradient-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step - 1) / 3) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {[
                    { num: 1, label: "Specialty", icon: Search },
                    { num: 2, label: "Physician", icon: UserCircle },
                    { num: 3, label: "Schedule", icon: CalendarIcon },
                    { num: 4, label: "Review", icon: Shield }
                ].map((s) => {
                    const isActive = step === s.num;
                    const isPassed = step > s.num;
                    return (
                        <div key={s.num} className="flex flex-col items-center gap-1.5 bg-white px-2 cursor-default shrink-0">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-lg border-2 transition-colors duration-300 ${isActive ? "border-primary bg-primary text-white shadow-md shadow-primary/30" :
                                    isPassed ? "border-primary bg-primary/10 text-primary" :
                                        "border-slate-200 bg-slate-50 text-slate-400"
                                }`}>
                                {isPassed ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <s.icon className="w-4 h-4 md:w-5 md:h-5" />}
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:block ${isActive || isPassed ? "text-primary" : "text-text-muted"}`}>{s.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Wizard Container */}
            <div className="bg-white rounded-3xl border border-border-light shadow-sm min-h-[500px] overflow-hidden relative">
                <AnimatePresence mode="wait">

                    {/* STEP 1: Specialty Selection */}
                    {step === 1 && (
                        <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                <Search className="w-6 h-6 text-primary" /> Select Clinical Department
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {specialties.map(spec => (
                                    <button
                                        key={spec.id}
                                        onClick={() => handleSpecialtySelect(spec.name)}
                                        className={`p-4 rounded-2xl border text-left transition-all group flex items-start gap-4 ${selectedSpecialty === spec.name ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-light bg-surface hover:border-indigo-300 hover:shadow-sm'}`}
                                    >
                                        <div className={`p-3 rounded-xl shrink-0 transition-colors ${selectedSpecialty === spec.name ? 'bg-primary text-white' : 'bg-white text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white'}`}>
                                            <spec.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${selectedSpecialty === spec.name ? 'text-text-primary' : 'text-text-secondary group-hover:text-primary'}`}>{spec.name}</h3>
                                            <p className="text-sm text-text-muted mt-1">{spec.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Doctor Selection */}
                    {step === 2 && (
                        <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="p-6 md:p-8 flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={handleBack} className="p-2 border border-border-light bg-surface hover:bg-white rounded-lg text-text-secondary transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary leading-none">Choose a Specialist</h2>
                                    <p className="text-sm font-medium text-primary mt-1">{selectedSpecialty}</p>
                                </div>
                            </div>

                            {availableDoctors.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center p-8 border-2 border-dashed border-border-light rounded-2xl">
                                    <UserCircle className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="font-semibold">No specialists currently listed for {selectedSpecialty}.</p>
                                    <button onClick={handleBack} className="mt-4 text-primary font-bold hover:underline">Select a different department</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableDoctors.map(doctor => (
                                        <div
                                            key={doctor.id}
                                            className="p-5 rounded-2xl border border-border-light bg-surface hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                                                    {doctor.avatar}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                                        {doctor.name} <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-black flex items-center gap-1">★ {doctor.rating}</span>
                                                    </h3>
                                                    <p className="text-sm font-medium text-text-secondary line-clamp-1">{doctor.specialty}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                <button
                                                    onClick={() => handleDoctorSelect(doctor)}
                                                    className="w-full sm:w-auto px-5 py-2.5 bg-white text-primary font-bold border border-primary/20 hover:bg-primary hover:text-white rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    Select <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: Date & Time */}
                    {step === 3 && selectedDoctor && (
                        <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-light">
                                <button onClick={handleBack} className="p-2 border border-border-light bg-surface hover:bg-white rounded-lg text-text-secondary transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary">Confirm Schedule</h2>
                                    <p className="text-sm text-text-muted mt-1">Select a suitable time slot for {selectedDoctor.name}.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Date Strip */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 block">Available Dates</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar mask-edges">
                                        {upcomingDates.map((date, idx) => {
                                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`flex flex-col items-center justify-center shrink-0 w-20 h-24 rounded-2xl border transition-all ${isSelected
                                                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                            : 'bg-surface border-border-light text-text-secondary hover:border-primary/50 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-primary-100' : 'text-text-muted'}`}>{format(date, "MMM")}</span>
                                                    <span className="text-2xl font-black mb-1 leading-none">{format(date, "dd")}</span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary-100' : 'text-text-muted'}`}>{format(date, "EEE")}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time Slots */}
                                {selectedDate && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 block flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" /> Available Slots
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {selectedDoctor.availableTimes.map((time) => {
                                                const isSelected = selectedTime === time;
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => handleDateTimeSelect(selectedDate, time)}
                                                        className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${isSelected
                                                                ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                                : 'bg-white border-border-light text-text-secondary hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Review & Confirm */}
                    {step === 4 && selectedDoctor && selectedDate && selectedTime && (
                        <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="p-6 md:p-8 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border-light">
                                <div className="flex items-center gap-4">
                                    <button onClick={handleBack} disabled={isConfirming} className="p-2 border border-border-light bg-surface hover:bg-white rounded-lg text-text-secondary transition-colors disabled:opacity-50"><ArrowLeft className="w-5 h-5" /></button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-text-primary">Final Review</h2>
                                        <p className="text-sm text-text-muted mt-1">Verify details and choose visit context.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                {/* Summary Card */}
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><ClipBoardIcon className="w-5 h-5 text-indigo-500" /> Booking Summary</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white rounded-2xl p-5 border border-indigo-100">
                                        <div>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Subject Provider</p>
                                            <p className="font-bold text-text-primary text-lg">{selectedDoctor.name}</p>
                                            <p className="text-sm font-medium text-text-secondary">{selectedDoctor.specialty}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Schedule Slot</p>
                                            <p className="font-bold text-text-primary text-lg text-indigo-700">{format(selectedDate, "EEEE, MMM do")}</p>
                                            <p className="text-sm font-bold text-indigo-600 mt-0.5">{selectedTime}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Options */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Visit Medium</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setVisitType("TELEHEALTH")}
                                                disabled={isConfirming}
                                                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${visitType === 'TELEHEALTH' ? 'border-primary bg-primary/5 text-primary' : 'border-border-light bg-surface text-text-secondary hover:bg-white'}`}
                                            >
                                                <Video className={`w-6 h-6 ${visitType === 'TELEHEALTH' ? 'text-primary' : 'text-text-muted'}`} />
                                                <span className="font-bold">Telehealth Video</span>
                                            </button>
                                            <button
                                                onClick={() => setVisitType("CLINIC")}
                                                disabled={isConfirming}
                                                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${visitType === 'CLINIC' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-border-light bg-surface text-text-secondary hover:bg-white'}`}
                                            >
                                                <MapPin className={`w-6 h-6 ${visitType === 'CLINIC' ? 'text-amber-500' : 'text-text-muted'}`} />
                                                <span className="font-bold">In-Person Clinic</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Reason for Visit (Optional)</label>
                                        <textarea
                                            placeholder="Briefly describe your symptoms or reason for the consultation..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            disabled={isConfirming}
                                            className="w-full min-h-[100px] p-4 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Boundary */}
                            <div className="mt-8 pt-6 border-t border-border-light">
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isConfirming}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-black text-white font-black text-lg tracking-wide rounded-xl shadow-xl shadow-slate-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isConfirming ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Securing Slot...</>
                                    ) : (
                                        <><CheckCircle2 className="w-6 h-6" /> Confirm Appointment Reservation</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

// Temporary Icon for the summary box
function ClipBoardIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
    )
}
