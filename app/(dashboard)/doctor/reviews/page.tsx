"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    MessageSquare,
    TrendingUp,
    Filter,
    Search,
    ThumbsUp,
    ShieldCheck,
    Clock,
    UserCircle,
    ChevronDown,
    HeartPulse,
    Sparkles,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Reply,
    Share
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

// --- Types & Mock Data ---
type RatingScore = 1 | 2 | 3 | 4 | 5;

interface PatientReview {
    id: string;
    patientId: string;
    patientName: string;
    avatar: string;
    date: string;
    rating: RatingScore;
    content: string;
    tags: string[];
    isVerified: boolean;
    visitedFor: string;
    reply?: {
        text: string;
        date: string;
    };
}

const mockReviews: PatientReview[] = [
    {
        id: "REV-9001",
        patientId: "PAT-8041",
        patientName: "Michael Chen",
        avatar: "M",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5,
        content: "Dr. Jenkins was extremely thorough in reviewing my KidneyNet AI results. She explained the stage 3a diagnostics clearly and gave me an actionable dietary plan. Very professional and empathetic.",
        tags: ["Thorough Examination", "Great Listener", "Clear Explanations"],
        isVerified: true,
        visitedFor: "Chronic Kidney Disease Consultation",
        reply: {
            text: "Thank you, Michael. It was a pleasure working with you to establish your new dietary targets. See you next month!",
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        }
    },
    {
        id: "REV-9002",
        patientId: "PAT-8042",
        patientName: "Emily Rodriguez",
        avatar: "E",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5,
        content: "I appreciate the use of the new AI inference tools. Dr. Jenkins helped calm my anxieties over my blood pressure spikes. The telehealth system worked flawlessly too.",
        tags: ["Modern Setup", "Punctual", "Empathy"],
        isVerified: true,
        visitedFor: "Hypertension / Telehealth Follow-up"
    },
    {
        id: "REV-9003",
        patientId: "PAT-8044",
        patientName: "Robert Taylor",
        avatar: "R",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4,
        content: "Good doctor. She knows her nephrology inside out. The waiting room was a bit crowded during my in-clinic visit, but her care was top-notch.",
        tags: ["Expert Knowledge", "Wait Time"],
        isVerified: true,
        visitedFor: "CKD Stage 4 Vitals Check"
    },
    {
        id: "REV-9004",
        patientId: "PAT-8045",
        patientName: "Alex Jordan",
        avatar: "A",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5,
        content: "Routine checkup went perfectly. Very fast and efficient review of my renal panel.",
        tags: ["Punctual", "Efficient"],
        isVerified: true,
        visitedFor: "Annual Checkup"
    },
    {
        id: "REV-9005",
        patientId: "PAT-8046",
        patientName: "Samantha Hughes",
        avatar: "S",
        date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4,
        content: "Dr. Jenkins addressed my elevated creatinine levels and ordered further screening promptly. I feel I am in good hands.",
        tags: ["Proactive", "Good Bedside Manner"],
        isVerified: true,
        visitedFor: "Lab Results Discussion"
    }
];

export default function DoctorReviewsPage() {
    const [reviews, setReviews] = useState<PatientReview[]>(mockReviews);
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState<RatingScore | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "REPLIED" | "UNREPLIED">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Reply Box State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // --- Derived Metrics ---
    const totalReviews = reviews.length;
    const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1);
    const fiveStarCount = reviews.filter(r => r.rating === 5).length;
    const fiveStarPercentage = Math.round((fiveStarCount / totalReviews) * 100);
    const pendingRepliesCount = reviews.filter(r => !r.reply).length;

    // --- Filtering & Sorting ---
    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRating = ratingFilter === "ALL" || r.rating === ratingFilter;
            const matchesStatus = statusFilter === "ALL" ||
                (statusFilter === "REPLIED" && !!r.reply) ||
                (statusFilter === "UNREPLIED" && !r.reply);

            return matchesSearch && matchesRating && matchesStatus;
        });
    }, [reviews, searchTerm, ratingFilter, statusFilter]);

    // Apply sorting: Most recent first
    const sortedReviews = useMemo(() => {
        return [...filteredReviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredReviews]);

    // Pagination Calculation
    const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);
    const paginatedReviews = sortedReviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle Reply Submission
    const handleSubmitReply = (reviewId: string) => {
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);

        setTimeout(() => {
            setReviews(prev => prev.map(r => {
                if (r.id === reviewId) {
                    return {
                        ...r,
                        reply: {
                            text: replyText.trim(),
                            date: new Date().toISOString()
                        }
                    };
                }
                return r;
            }));
            setReplyingTo(null);
            setReplyText("");
            setIsSubmittingReply(false);
        }, 800);
    };

    // Rating Bar Chart Breakdown (5 stars to 1 star)
    const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return { star, count, percentage };
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Patient Reviews</h1>
                    <p className="text-text-muted mt-1">Monitor your clinical performance metrics and respond to patient sentiment.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-light rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm font-medium text-sm">
                        <Share className="w-4 h-4" />
                        Share Summary
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow font-medium text-sm">
                        <TrendingUp className="w-4 h-4" />
                        Generate Analytics PDF
                    </button>
                </div>
            </div>

            {/* Top Stat Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Aggregate Score Card */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-border-light shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Overall Rating</h3>
                    <div className="flex items-end gap-2 justify-center">
                        <span className="text-6xl font-black text-text-primary tracking-tighter leading-none">{averageRating}</span>
                        <span className="text-xl text-text-muted font-bold mb-1.5">/ 5</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-7 h-7 ${star <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                            />
                        ))}
                    </div>

                    <p className="text-sm font-medium text-text-secondary mt-3">Based on {totalReviews} verified patient visits</p>
                </motion.div>

                {/* Rating Distribution Progress Bars */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-light shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Sentiment Distribution
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 shadow-sm flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5" /> {fiveStarPercentage}% 5-Star Ratio
                        </span>
                    </div>

                    <div className="space-y-3">
                        {ratingBreakdown.map((row) => (
                            <div key={row.star} className="flex items-center gap-4 text-sm">
                                <span className="font-bold text-text-secondary w-6 flex items-center gap-1 shrink-0">{row.star} <Star className="w-3 h-3 text-text-muted fill-text-muted" /></span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative border border-border-light">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${row.percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${row.star >= 4 ? 'bg-amber-400' : row.star === 3 ? 'bg-indigo-400' : 'bg-rose-400'}`}
                                    />
                                </div>
                                <span className="text-text-muted font-medium w-8 text-right shrink-0">{row.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>

            {/* Quick Actions / Alerts */}
            {pendingRepliesCount > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shadow-indigo-100">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900">Patient Engagement Required</h4>
                            <p className="text-sm text-indigo-700">You have {pendingRepliesCount} unreplied {pendingRepliesCount === 1 ? 'review' : 'reviews'}. Prompt replies boost patient retention scores by 24%.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setStatusFilter("UNREPLIED"); setIsFilterOpen(true); }}
                        className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors"
                    >
                        Filter Unreplied
                    </button>
                </motion.div>
            )}

            {/* Filters Navigation Bar */}
            <div className="bg-white rounded-2xl border border-border-light p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by patient name or keyword (e.g., 'telehealth')..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isFilterOpen || ratingFilter !== "ALL" || statusFilter !== "ALL"
                                    ? "bg-primary/5 border-primary/20 text-primary"
                                    : "bg-white border-border-light text-text-secondary hover:bg-surface"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Refine Feed
                            {(ratingFilter !== "ALL" || statusFilter !== "ALL") && (
                                <span className="w-2 h-2 rounded-full bg-primary ml-1" />
                            )}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-border-light grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Star Rating</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setRatingFilter("ALL")}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${ratingFilter === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                                        >
                                            All Ratings
                                        </button>
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <button
                                                key={`filter-${star}`}
                                                onClick={() => setRatingFilter(star as RatingScore)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border flex items-center gap-1 ${ratingFilter === star ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-white text-text-secondary border-border-light hover:bg-surface"}`}
                                            >
                                                {star} <Star className={`w-3.5 h-3.5 ${ratingFilter === star ? 'fill-amber-500 text-amber-500' : 'fill-slate-300 text-slate-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Reply Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as "ALL" | "REPLIED" | "UNREPLIED")}
                                        className="w-full p-2.5 rounded-lg border border-border-light bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none max-w-xs"
                                    >
                                        <option value="ALL">All Feed (Replied + Unreplied)</option>
                                        <option value="UNREPLIED">Awaiting Doctor Response</option>
                                        <option value="REPLIED">Doctor Responded</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List of Reviews Block */}
            <div className="space-y-6">
                <AnimatePresence>
                    {paginatedReviews.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-20" />
                            <p className="font-bold text-xl text-text-primary">No clinical reviews match query</p>
                            <p className="text-text-secondary mt-1">Try resetting filters to view all patient feedback.</p>
                        </div>
                    ) : (
                        paginatedReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white rounded-2xl border border-border-light p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                            >
                                {/* Review Header (Patient Info + Stars) */}
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4 border-b border-border-light pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-primary text-base flex items-center gap-1.5">
                                                {review.patientName}
                                                {review.isVerified && (
                                                    <span title="Verified Clinical Visit"><ShieldCheck className="w-4 h-4 text-emerald-500" /></span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-text-muted font-medium mb-1 flex items-center gap-1.5 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(parseISO(review.date), "MMMM d, yyyy")} •
                                                Used <HeartPulse className="w-3 h-3 ml-0.5 text-primary" /> {review.visitedFor}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end shrink-0">
                                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                                            <span className="font-bold text-amber-700 mr-1">{review.rating}.0</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'fill-slate-200 text-slate-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-2 mr-1">
                                            {formatDistanceToNow(parseISO(review.date))} ago
                                        </span>
                                    </div>
                                </div>

                                {/* Review Text Content */}
                                <div className="mb-4">
                                    <p className="text-text-primary leading-relaxed text-[15px]">"{review.content}"</p>
                                </div>

                                {/* Smart Tags */}
                                {review.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {review.tags.map(tag => (
                                            <span key={tag} className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Doctor's Interaction / Reply Section */}
                                <div className="mt-2 bg-surface rounded-xl p-4 border border-border-light relative">
                                    {review.reply ? (
                                        <div className="pl-4 border-l-2 border-primary/30 relative py-1">
                                            <div className="absolute top-1 -left-3 bg-white border border-primary/30 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                                <UserCircle className="w-3 h-3 text-primary" />
                                            </div>
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-bold text-primary tracking-widest uppercase">Your Response</p>
                                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{formatDistanceToNow(parseISO(review.reply.date))} ago</span>
                                            </div>
                                            <p className="text-sm text-text-secondary italic">"{review.reply.text}"</p>
                                        </div>
                                    ) : (
                                        replyingTo === review.id ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Reply className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-bold text-text-primary">Reply to {review.patientName}</span>
                                                </div>
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Acknowledge the feedback professionally. This will be publicly attached to their review..."
                                                    className="w-full bg-white border border-border-light rounded-xl p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                        className="px-4 py-2 border border-border-light bg-white text-text-secondary rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                                                        disabled={isSubmittingReply}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmitReply(review.id)}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                        disabled={isSubmittingReply || !replyText.trim()}
                                                    >
                                                        {isSubmittingReply ? (
                                                            <><ChevronRight className="w-4 h-4 animate-spin" /> Submitting</>
                                                        ) : (
                                                            <><MessageSquare className="w-4 h-4" /> Publish Reply</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-text-muted italic flex items-center gap-1.5"><Clock className="w-4 h-4" /> Awaiting clinical response...</p>
                                                <button
                                                    onClick={() => setReplyingTo(review.id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-primary border border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-xl text-sm font-bold transition-colors shadow-sm"
                                                >
                                                    <Reply className="w-4 h-4" /> Respond Publicly
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${currentPage === idx + 1
                                    ? "gradient-primary text-white shadow-md shadow-primary/20"
                                    : "border border-border-light bg-white text-text-secondary hover:bg-surface"
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-border-light bg-white text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

        </div>
    );
}
