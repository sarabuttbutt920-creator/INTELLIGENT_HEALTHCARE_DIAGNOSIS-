"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Send,
    Paperclip,
    Mic,
    MoreVertical,
    Phone,
    Video,
    Info,
    Check,
    CheckCheck,
    Image as ImageIcon,
    FileText,
    Activity,
    Shield,
    HeartPulse,
    Clock,
    UserCircle,
    MapPin,
    ArrowLeft
} from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

// --- Types ---
interface Message {
    id: string;
    senderId: "PATIENT" | string; // System user is PATIENT
    text: string;
    timestamp: string; // ISO String
    status: "SENT" | "DELIVERED" | "READ";
    attachment?: {
        type: "PDF" | "IMAGE";
        name: string;
        size: string;
    };
}

interface Conversation {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    avatar: string;
    isOnline: boolean;
    lastMessage: string;
    lastMessageTime: string; // ISO
    unreadCount: number;
    messages: Message[];
}

// --- Mock Data ---
const mockConversations: Conversation[] = [
    {
        id: "CONV-1",
        doctorId: "DOC-102",
        doctorName: "Dr. Sarah Jenkins",
        specialty: "Nephrology Dept.",
        avatar: "SJ",
        isOnline: true,
        lastMessage: "I've reviewed your recent CMP panel. Looks stable.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        unreadCount: 1,
        messages: [
            {
                id: "MSG-101",
                senderId: "PATIENT",
                text: "Hi Dr. Jenkins, attached is my blood pressure log for the first week of March as requested.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                status: "READ",
                attachment: { type: "PDF", name: "BP_Log_March_Week1.pdf", size: "245 KB" }
            },
            {
                id: "MSG-102",
                senderId: "DOC-102",
                text: "Thank you for sending this over. I will review it shortly.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
                status: "READ"
            },
            {
                id: "MSG-103",
                senderId: "PATIENT",
                text: "Sounds good, looking forward to the telehealth session.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
                status: "READ"
            },
            {
                id: "MSG-104",
                senderId: "DOC-102",
                text: "I've reviewed your recent CMP panel. Looks stable. The creatinine levels went down slightly which is an excellent sign.",
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                status: "DELIVERED"
            }
        ]
    },
    {
        id: "CONV-2",
        doctorId: "DOC-105",
        doctorName: "Dr. Marcus Vance",
        specialty: "General Practice",
        avatar: "MV",
        isOnline: false,
        lastMessage: "Your annual checkup is confirmed for next week.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        unreadCount: 0,
        messages: [
            {
                id: "MSG-201",
                senderId: "DOC-105",
                text: "Hello Michael, just validating that your annual physical examination is still confirmed.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
                status: "READ"
            },
            {
                id: "MSG-202",
                senderId: "PATIENT",
                text: "Yes, I will be there at the main campus.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString(),
                status: "READ"
            },
            {
                id: "MSG-203",
                senderId: "DOC-105",
                text: "Your annual checkup is confirmed for next week.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                status: "READ"
            }
        ]
    }
];

// Helper to format message timestamps
const formatMessageTime = (isoString: string) => {
    const date = parseISO(isoString);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
};

export default function PatientChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [activeChatId, setActiveChatId] = useState<string | null>(mockConversations[0].id);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showContextPanel, setShowContextPanel] = useState(true);
    const [isMobileView, setIsMobileView] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter conversations
    const filteredConversations = conversations.filter(c =>
        c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeChat = conversations.find(c => c.id === activeChatId);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages]);

    // Handle viewport changes for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setShowContextPanel(false);
                if (window.innerWidth < 768) {
                    setIsMobileView(true);
                } else {
                    setIsMobileView(false);
                }
            } else {
                setShowContextPanel(true);
                setIsMobileView(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        const newMessage: Message = {
            id: `MSG-${Date.now()}`,
            senderId: "PATIENT",
            text: messageInput.trim(),
            timestamp: new Date().toISOString(),
            status: "SENT"
        };

        setConversations(prev => prev.map(conv => {
            if (conv.id === activeChatId) {
                return {
                    ...conv,
                    lastMessage: newMessage.text,
                    lastMessageTime: newMessage.timestamp,
                    messages: [...conv.messages, newMessage]
                };
            }
            return conv;
        }));

        setMessageInput("");

        // Simulate Delivery & Read receipts
        setTimeout(() => {
            setConversations(prev => prev.map(conv => {
                if (conv.id === activeChatId) {
                    const updatedMsgs = [...conv.messages];
                    updatedMsgs[updatedMsgs.length - 1].status = "DELIVERED";
                    return { ...conv, messages: updatedMsgs };
                }
                return conv;
            }));

            setTimeout(() => {
                setConversations(prev => prev.map(conv => {
                    if (conv.id === activeChatId) {
                        const updatedMsgs = [...conv.messages];
                        if (updatedMsgs[updatedMsgs.length - 1].status === "DELIVERED") {
                            updatedMsgs[updatedMsgs.length - 1].status = "READ";
                        }
                        return { ...conv, messages: updatedMsgs };
                    }
                    return conv;
                }));
            }, 1500);
        }, 800);
    };

    const handleSelectChat = (id: string) => {
        setActiveChatId(id);
        // Mark as read
        setConversations(prev => prev.map(conv => conv.id === id ? { ...conv, unreadCount: 0 } : conv));
    };

    return (
        <div className="h-[calc(100vh-6rem)] min-h-[600px] flex gap-6 pb-6">

            {/* Left Panel: Conversation List */}
            <div className={`bg-white rounded-3xl border border-border-light shadow-sm flex flex-col overflow-hidden w-full md:w-80 lg:w-96 shrink-0 transition-all ${isMobileView && activeChatId ? 'hidden' : 'flex'}`}>

                {/* Header & Search */}
                <div className="p-5 border-b border-border-light bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-text-primary mb-4 tracking-tight">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search doctors or specialty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm shadow-sm"
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center p-6 text-text-muted">
                            <p className="text-sm font-semibold">No clinicians found.</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isActive = activeChatId === conv.id;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectChat(conv.id)}
                                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 relative ${isActive ? 'bg-primary border-primary shadow-md shadow-primary/20 view-active-chat text-white' : 'bg-transparent border-transparent hover:bg-surface text-text-primary'}`}
                                >
                                    {/* Action Dot for Active State */}
                                    {isActive && (
                                        <motion.div layoutId="active-chat-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-md" />
                                    )}

                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-2 ${isActive ? 'bg-white/20 border-white/30 text-white' : 'gradient-primary text-white border-white'}`}>
                                            {conv.avatar}
                                        </div>
                                        {/* Online status indicator */}
                                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${conv.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className={`font-bold truncate ${isActive ? 'text-white' : 'text-text-primary'}`}>{conv.doctorName}</h4>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white/70' : 'text-text-muted'}`}>
                                                {formatMessageTime(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-text-secondary'} font-medium`}>
                                            {conv.lastMessage}
                                        </p>
                                    </div>

                                    {/* Unread Badge */}
                                    {conv.unreadCount > 0 && !isActive && (
                                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Center Panel: Active Chat Engine */}
            <div className={`flex-1 bg-white rounded-3xl border border-border-light shadow-sm flex flex-col overflow-hidden relative ${isMobileView && !activeChatId ? 'hidden' : 'flex'}`}>

                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 border-b border-border-light bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
                            <div className="flex items-center gap-4">
                                {/* Mobile Back Button */}
                                {isMobileView && (
                                    <button onClick={() => setActiveChatId(null)} className="p-2 -ml-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-surface transition-colors">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}

                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white">
                                        {activeChat.avatar}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${activeChat.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                        {activeChat.doctorName}
                                        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md uppercase tracking-widest font-bold hidden sm:block">
                                            {activeChat.specialty}
                                        </span>
                                    </h3>
                                    <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${activeChat.isOnline ? 'text-emerald-500' : 'text-text-muted mt-0.5'}`}>
                                        {activeChat.isOnline ? (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Clinic Online</>
                                        ) : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <button className="p-2.5 text-text-secondary hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100 hidden sm:block">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 text-text-secondary hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowContextPanel(!showContextPanel)}
                                    className={`p-2.5 rounded-xl transition-all shadow-sm border ${showContextPanel ? 'bg-primary/10 text-primary border-primary/20' : 'text-text-secondary hover:bg-surface border-transparent hover:border-border-light'}`}
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* HIPAA Banner */}
                        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">End-to-End Encrypted Clinical Communication</p>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 bg-surface overflow-y-auto custom-scrollbar p-6 space-y-6 relative">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-64 h-64">
                                <Shield className="w-full h-full text-slate-900" />
                            </div>

                            <AnimatePresence initial={false}>
                                {activeChat.messages.map((msg, idx) => {
                                    const isPatient = msg.senderId === "PATIENT";
                                    const showTime = idx === 0 || parseISO(msg.timestamp).getTime() - parseISO(activeChat.messages[idx - 1].timestamp).getTime() > 1000 * 60 * 30; // 30 min diff

                                    return (
                                        <div key={msg.id} className="flex flex-col relative z-10">
                                            {showTime && (
                                                <div className="flex justify-center mb-6 mt-2">
                                                    <span className="text-[10px] font-bold text-text-muted bg-white px-3 py-1 rounded-full border border-border-light shadow-sm tracking-widest uppercase">
                                                        {format(parseISO(msg.timestamp), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                            )}

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex max-w-[85%] sm:max-w-[75%] ${isPatient ? 'self-end' : 'self-start'}`}
                                            >
                                                <div className={`relative px-4 sm:px-5 py-3 shadow-md ${isPatient
                                                        ? 'bg-slate-800 text-white rounded-3xl rounded-br-sm border border-slate-700'
                                                        : 'bg-white text-text-primary rounded-3xl rounded-bl-sm border border-border-light'
                                                    }`}>

                                                    {/* Attachments rendering */}
                                                    {msg.attachment && (
                                                        <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 border ${isPatient ? 'bg-slate-900/50 border-slate-600' : 'bg-surface border-border-light'}`}>
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPatient ? 'bg-slate-700 text-slate-300' : 'bg-white shadow-sm text-primary'}`}>
                                                                {msg.attachment.type === 'PDF' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div className="min-w-0 pr-2">
                                                                <p className={`text-sm font-bold truncate ${isPatient ? 'text-white' : 'text-text-primary'}`}>{msg.attachment.name}</p>
                                                                <p className={`text-[10px] uppercase tracking-wider ${isPatient ? 'text-slate-400' : 'text-text-muted'} mt-0.5`}>{msg.attachment.size} • {msg.attachment.type}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-[15px] leading-relaxed relative z-10 break-words">{msg.text}</p>

                                                    {/* Meta details inside bubble */}
                                                    <div className={`flex items-center justify-end gap-1.5 mt-2 ${isPatient ? 'text-slate-400' : 'text-text-muted'}`}>
                                                        <span className="text-[10px] font-bold">{format(parseISO(msg.timestamp), "h:mm a")}</span>
                                                        {isPatient && (
                                                            <span>
                                                                {msg.status === 'SENT' && <Check className="w-3.5 h-3.5" />}
                                                                {msg.status === 'DELIVERED' && <CheckCheck className="w-3.5 h-3.5 text-slate-300" />}
                                                                {msg.status === 'READ' && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white border-t border-border-light p-4 shrink-0 z-20">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-surface p-2 rounded-2xl border border-border-light focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">

                                <button type="button" className="p-3 text-text-muted hover:text-text-primary rounded-xl hover:bg-white transition-colors shrink-0">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a secure message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none px-2 py-3 text-[15px] max-h-32 min-h-[48px]"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />

                                {messageInput.trim() ? (
                                    <motion.button
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        type="submit"
                                        className="p-3 bg-primary hover:bg-indigo-600 text-white rounded-xl shadow-md shadow-primary/20 transition-all shrink-0"
                                    >
                                        <Send className="w-5 h-5 ml-0.5" />
                                    </motion.button>
                                ) : (
                                    <button type="button" className="p-3 text-text-muted hover:text-text-primary rounded-xl hover:bg-white transition-colors shrink-0">
                                        <Mic className="w-5 h-5" />
                                    </button>
                                )}
                            </form>
                            <p className="text-center text-[10px] text-text-muted font-bold tracking-widest uppercase mt-3">Messages are secured via clinical-grade encryption.</p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-slate-50 border border-border-light flex items-center justify-center mb-6 shadow-sm">
                            <Shield className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">Secure Inbox</h3>
                        <p className="text-text-muted max-w-sm">Select a clinical thread from the left navigation pane to view your encrypted communication history.</p>
                    </div>
                )}
            </div>

            {/* Right Panel: Doctor / Clinic Context */}
            <AnimatePresence>
                {showContextPanel && activeChat && !isMobileView && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-white rounded-3xl border border-border-light shadow-sm flex flex-col overflow-hidden shrink-0"
                    >
                        {/* Header Context */}
                        <div className="p-6 border-b border-border-light flex flex-col items-center text-center relative">
                            <div className="absolute top-0 right-0 w-full h-24 bg-primary/5 -z-10" />

                            <div className="w-24 h-24 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white mb-4 mt-4 relative">
                                {activeChat.avatar}
                                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${activeChat.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>

                            <h3 className="text-xl font-bold text-text-primary">{activeChat.doctorName}</h3>
                            <p className="text-sm font-semibold text-primary mt-1">{activeChat.specialty}</p>

                            <div className="flex items-center gap-3 mt-5">
                                <button className="w-10 h-10 bg-slate-50 border border-border-light hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 rounded-full flex items-center justify-center text-text-secondary transition-colors transition-all shadow-sm">
                                    <Phone className="w-4 h-4" />
                                </button>
                                <button className="w-10 h-10 bg-slate-50 border border-border-light hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 rounded-full flex items-center justify-center text-text-secondary transition-colors transition-all shadow-sm">
                                    <Video className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Clinic Info blocks */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                            {/* Appt widget */}
                            <div className="bg-surface rounded-2xl p-4 border border-border-light shadow-sm">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3"><Clock className="w-3.5 h-3.5" /> Next Visit</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-border-light flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold uppercase text-primary leading-none mt-1">Mar</span>
                                        <span className="text-sm font-black text-text-primary mb-0.5">14</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-text-primary">Telehealth Session</p>
                                        <p className="text-xs text-text-muted font-medium mt-0.5">01:00 PM • Video</p>
                                    </div>
                                </div>
                                <button className="w-full mt-3 py-2 text-xs font-bold border border-border-light bg-white rounded-lg hover:bg-slate-50 text-text-secondary transition-colors">
                                    Manage Booking
                                </button>
                            </div>

                            {/* About block */}
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Facility Details</p>
                                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-border-light shadow-sm">
                                    <MapPin className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-text-primary">
                                        MediIntel Main Campus<br />
                                        Suite 405, 100 Health Way<br />
                                        San Francisco, CA 94107
                                    </p>
                                </div>
                            </div>

                            {/* Shared files */}
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Shared Files</p>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 bg-white p-3 rounded-xl border border-border-light shadow-sm hover:border-primary/30 transition-colors group">
                                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1 text-left">
                                            <p className="text-xs font-bold text-text-primary truncate">BP_Log_March_Week1.pdf</p>
                                            <p className="text-[10px] font-medium text-text-muted mt-0.5">245 KB • Sent Yesterday</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
