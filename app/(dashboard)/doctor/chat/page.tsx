"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Mic,
    Send,
    FileText,
    Image as ImageIcon,
    Check,
    CheckCheck,
    Clock,
    UserCircle,
    Activity,
    Info,
    ChevronLeft,
    MessageSquare,
    HeartPulse
} from "lucide-react";
import { format, formatDistanceToNow, isToday, parseISO } from "date-fns";

// --- Mock Data ---
interface Message {
    id: string;
    text: string;
    timestamp: string;
    isSelf: boolean; // true if sent by doctor
    status: "SENT" | "DELIVERED" | "READ";
    attachment?: {
        name: string;
        size: string;
        type: "PDF" | "IMAGE";
    };
}

interface ChatSession {
    id: string;
    patientId: string;
    patientName: string;
    avatar: string;
    isOnline: boolean;
    unreadCount: number;
    primaryCondition: string;
    messages: Message[];
}

const mockChats: ChatSession[] = [
    {
        id: "CHAT-8041",
        patientId: "PAT-8041",
        patientName: "Michael Chen",
        avatar: "M",
        isOnline: true,
        unreadCount: 2,
        primaryCondition: "CKD Stage 3a",
        messages: [
            {
                id: "M1",
                text: "Hello Dr. Jenkins, I wanted to follow up on the new dietary restrictions you mentioned.",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                isSelf: false,
                status: "READ"
            },
            {
                id: "M2",
                text: "Sure, Michael. What specific concerns did you have regarding the sodium limits?",
                timestamp: new Date(Date.now() - 3500000).toISOString(),
                isSelf: true,
                status: "READ"
            },
            {
                id: "M3",
                text: "I've been finding it difficult to cook without my usual seasonings. Are there salt substitutes I can use safely?",
                timestamp: new Date(Date.now() - 300000).toISOString(),
                isSelf: false,
                status: "DELIVERED"
            },
            {
                id: "M4",
                text: "Also, I've attached my latest home blood pressure log for this week as requested.",
                timestamp: new Date(Date.now() - 240000).toISOString(),
                isSelf: false,
                status: "DELIVERED",
                attachment: {
                    name: "BP_Log_March_Week1.pdf",
                    size: "1.2 MB",
                    type: "PDF"
                }
            }
        ]
    },
    {
        id: "CHAT-8042",
        patientId: "PAT-8042",
        patientName: "Emily Rodriguez",
        avatar: "E",
        isOnline: false,
        unreadCount: 0,
        primaryCondition: "Hypertension",
        messages: [
            {
                id: "M1",
                text: "Good morning Emily, your lab results came back. The KidneyNet AI inference showed no immediate risks.",
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                isSelf: true,
                status: "READ"
            },
            {
                id: "M2",
                text: "That is wonderful news! Thank you so much for the update, Dr. Jenkins.",
                timestamp: new Date(Date.now() - 86000000 * 2).toISOString(),
                isSelf: false,
                status: "READ"
            }
        ]
    },
    {
        id: "CHAT-8044",
        patientId: "PAT-8044",
        patientName: "Robert Taylor",
        avatar: "R",
        isOnline: true,
        unreadCount: 0,
        primaryCondition: "CKD Stage 4",
        messages: [
            {
                id: "M1",
                text: "Robert, please remember to fast for 12 hours before your blood work tomorrow.",
                timestamp: new Date(Date.now() - 5000000).toISOString(),
                isSelf: true,
                status: "READ"
            },
            {
                id: "M2",
                text: "Understood. I'll be at the clinic at 8 AM sharp.",
                timestamp: new Date(Date.now() - 4000000).toISOString(),
                isSelf: false,
                status: "READ"
            }
        ]
    }
];

export default function DoctorChatPage() {
    const [chats, setChats] = useState<ChatSession[]>(mockChats);
    const [activeChatId, setActiveChatId] = useState<string>(chats[0].id);
    const [searchTerm, setSearchTerm] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showInfoPanel, setShowInfoPanel] = useState(true);

    // For mobile responsiveness
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Active Chat Object
    const activeChat = chats.find(c => c.id === activeChatId);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    // Handle sending message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChat) return;

        const newMessage: Message = {
            id: `M_NEW_${Date.now()}`,
            text: messageInput.trim(),
            timestamp: new Date().toISOString(),
            isSelf: true,
            status: "SENT"
        };

        const updatedChats = chats.map(chat => {
            if (chat.id === activeChatId) {
                return { ...chat, messages: [...chat.messages, newMessage] };
            }
            return chat;
        });

        setChats(updatedChats);
        setMessageInput("");

        // Simulate delivery update
        setTimeout(() => {
            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    const updatedMsgs = chat.messages.map(msg =>
                        msg.id === newMessage.id ? { ...msg, status: "DELIVERED" as "DELIVERED" } : msg
                    );
                    return { ...chat, messages: updatedMsgs };
                }
                return chat;
            }));
        }, 1500);
    };

    // Filter Chat List
    const filteredChats = chats.filter(c => c.patientName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Mark as read when opening
    useEffect(() => {
        if (activeChat && activeChat.unreadCount > 0) {
            setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, unreadCount: 0 } : c));
        }
    }, [activeChatId, activeChat]);

    // Formatting Helpers
    const formatMessageTime = (isoString: string) => {
        const date = parseISO(isoString);
        return isToday(date) ? format(date, "h:mm a") : format(date, "MMM d, h:mm a");
    };

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-8rem)] min-h-[600px] bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col md:flex-row shadow-xl shadow-slate-200/50">

            {/* Left Sidebar: Conversations List */}
            <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border-light flex flex-col bg-slate-50/50 ${!showChatList && 'hidden md:flex'}`}>

                {/* Search & Header */}
                <div className="p-4 border-b border-border-light bg-white">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Patient Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredChats.length === 0 ? (
                        <div className="p-6 text-center text-text-muted text-sm">No conversations found.</div>
                    ) : (
                        filteredChats.map((chat) => {
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            const isActive = chat.id === activeChatId;

                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => {
                                        setActiveChatId(chat.id);
                                        if (window.innerWidth < 768) setShowChatList(false); // Mobile handling
                                    }}
                                    className={`w-full p-4 flex items-start gap-3 transition-colors border-b border-border-light text-left relative ${isActive ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-100/80 bg-white'}`}
                                >
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}

                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm ${isActive ? 'gradient-primary' : 'bg-slate-300'}`}>
                                            {chat.avatar}
                                        </div>
                                        {chat.isOnline && (
                                            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold truncate ${isActive ? 'text-primary' : 'text-text-primary'}`}>{chat.patientName}</h3>
                                            {lastMsg && (
                                                <span className={`text-[10px] shrink-0 font-medium ${isActive || chat.unreadCount > 0 ? 'text-primary' : 'text-text-muted'}`}>
                                                    {formatDistanceToNow(parseISO(lastMsg.timestamp), { addSuffix: true }).replace('about', '').trim()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                                                {lastMsg ? (lastMsg.isSelf ? `You: ${lastMsg.text}` : lastMsg.text) : "No messages yet"}
                                            </p>
                                            {chat.unreadCount > 0 && (
                                                <span className="shrink-0 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Middle Section: Active Chat Window */}
            <div className={`flex-1 flex flex-col bg-white md:flex ${showChatList && 'hidden'}`}>

                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 md:px-6 border-b border-border-light flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg"
                                    onClick={() => setShowChatList(true)}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold">
                                        {activeChat.avatar}
                                    </div>
                                    {activeChat.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-text-primary leading-tight">{activeChat.patientName}</h2>
                                    <p className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
                                        <Activity className="w-3 h-3 text-rose-500" /> {activeChat.primaryCondition}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-1.5">
                                <button className="p-2 text-text-secondary hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0" title="Telehealth Video Call">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shrink-0" title="Voice Call">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <div className="w-px h-5 bg-border-light my-auto mx-1 hidden sm:block" />
                                <button
                                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                                    className={`p-2 hidden sm:block rounded-xl transition-colors ${showInfoPanel ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-surface'}`}
                                    title="Toggle Patient Info"
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-text-secondary hover:bg-surface rounded-xl transition-colors shrink-0">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Message History Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafc]/50 relative scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" style={{ backgroundSize: '200px', backgroundBlendMode: 'multiply' }}>
                            <div className="flex flex-col gap-4">
                                {/* Medical Disclaimer Notice */}
                                <div className="text-center my-2">
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm shadow-amber-200/50">
                                        End-to-End Encrypted HIPAA Compliant Line
                                    </span>
                                </div>

                                {activeChat.messages.map((msg, index) => {
                                    const showTime = index === 0 || parseISO(msg.timestamp).getTime() - parseISO(activeChat.messages[index - 1].timestamp).getTime() > 1800000; // 30 mins

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            layout
                                            className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                                        >
                                            {showTime && (
                                                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2 mt-4 text-center w-full block">
                                                    {formatMessageTime(msg.timestamp)}
                                                </span>
                                            )}

                                            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group ${msg.isSelf ? 'bg-primary text-white rounded-tr-sm border border-primary/20' : 'bg-white text-text-primary rounded-tl-sm border border-border-light'}`}>

                                                {/* Text Body */}
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                                {/* Attachments UI */}
                                                {msg.attachment && (
                                                    <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors backdrop-blur-sm ${msg.isSelf ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${msg.isSelf ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                                                            {msg.attachment.type === 'PDF' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm truncate leading-tight">{msg.attachment.name}</p>
                                                            <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${msg.isSelf ? 'text-white/70' : 'text-slate-500'}`}>{msg.attachment.size} • {msg.attachment.type}</p>
                                                        </div>
                                                        <div className="shrink-0 pl-2">
                                                            <div className={`p-1.5 rounded-full ${msg.isSelf ? 'bg-white/20' : 'bg-white border shadow-sm'}`}>
                                                                <FileText className={`w-3.5 h-3.5 ${msg.isSelf ? 'text-white' : 'text-slate-600'}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1.5 mt-1 opacity-60">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${msg.isSelf ? 'text-white/80' : 'text-slate-400'}`}>
                                                        {format(parseISO(msg.timestamp), "h:mm a")}
                                                    </span>
                                                    {msg.isSelf && (
                                                        <span>
                                                            {msg.status === "SENT" && <Check className="w-3 h-3 text-white/50" />}
                                                            {msg.status === "DELIVERED" && <CheckCheck className="w-3 h-3 text-white" />}
                                                            {msg.status === "READ" && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Message Input Box */}
                        <div className="p-3 md:p-4 bg-white border-t border-border-light shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative bg-surface p-1.5 rounded-2xl border border-border-light focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">

                                <button type="button" className="p-2.5 text-text-muted hover:text-primary transition-colors hover:bg-white rounded-xl shrink-0" title="Attach Document">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2.5 text-text-muted hover:text-primary transition-colors hover:bg-white rounded-xl shrink-0" title="Voice Message">
                                    <Mic className="w-5 h-5" />
                                </button>

                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Securely message clinical instructions or file attachments..."
                                    className="flex-1 max-h-32 min-h-[44px] py-2.5 px-2 bg-transparent outline-none resize-none text-sm text-text-primary place-content-center custom-scrollbar"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="p-2.5 gradient-primary text-white rounded-xl shrink-0 shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:shadow-lg transition-all"
                                >
                                    <Send className="w-4 h-4 translate-x-px translate-y-px" />
                                </button>

                            </form>
                            <p className="text-center text-[10px] text-text-muted font-medium mt-2">
                                <Clock className="w-3 h-3 inline mr-1 opacity-50 mb-0.5" />
                                Patient standard response times average 4 hours.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No Active Thread</h3>
                        <p className="text-sm text-text-secondary mb-6 text-center max-w-sm">Select a patient conversation from the side panel to view their secure clinical messages.</p>
                        <button
                            className="gradient-primary text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow md:hidden"
                            onClick={() => setShowChatList(true)}
                        >
                            <Search className="w-4 h-4" /> Browse Patient Inbox
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side: Patient Context Panel (Collapsible desktop) */}
            <AnimatePresence>
                {activeChat && showInfoPanel && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-l border-border-light bg-slate-50/30 overflow-hidden flex-shrink-0 hidden lg:flex flex-col"
                    >
                        <div className="p-6 border-b border-border-light bg-white shrink-0">
                            <div className="w-20 h-20 rounded-full gradient-primary text-white flex items-center justify-center text-3xl font-bold font-mono mx-auto mb-4 shadow-lg shadow-primary/20 relative">
                                {activeChat.avatar}
                                {activeChat.isOnline && (
                                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-text-primary text-center leading-tight mb-1">{activeChat.patientName}</h3>
                            <p className="text-xs text-text-muted text-center font-mono bg-surface border border-border-light w-fit mx-auto px-2 py-0.5 rounded">{activeChat.patientId}</p>

                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-indigo-100">
                                    <UserCircle className="w-4 h-4" /> EHR Chart
                                </button>
                                <button className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-100">
                                    <Activity className="w-4 h-4" /> Vitals
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div>
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Health Status</h4>
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-rose-500 mb-0.5">Primary Diagnosis</p>
                                    <p className="text-sm font-semibold text-rose-700 flex items-center gap-2"><HeartPulse className="w-4 h-4" /> {activeChat.primaryCondition}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Communication Log</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-text-primary">Last Telehealth</p>
                                            <p className="text-xs text-text-secondary mt-0.5">March 14, 2024 (15 mins)</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <FileText className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-text-primary">EHR Note Updated</p>
                                            <p className="text-xs text-text-secondary mt-0.5">March 20, 2024</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
