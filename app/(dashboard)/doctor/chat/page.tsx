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
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

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

// --- Helpers ---
const formatMessageTime = (dateInput: string | Date | number) => {
    if (!dateInput) return '';
    try {
        const date = new Date(dateInput);
        if (isToday(date)) return format(date, "h:mm a");
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMM d, h:mm a");
    } catch (e) {
        return '';
    }
};

export default function DoctorChatPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]); // Current active chat messages
    const [searchTerm, setSearchTerm] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showInfoPanel, setShowInfoPanel] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // For mobile responsiveness
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChat = chats.find(c => c.id === activeChatId);

    // Fetch lists
    const fetchThreads = async () => {
        try {
            const res = await fetch('/api/chat/threads');
            const data = await res.json();
            if (data.success) {
                setCurrentUserId(data.currentUserId);
                const existingThreads = data.threads.map((t: any) => ({
                    id: t.thread_id.toString(),
                    patientId: t.patient.patient_id.toString(),
                    patientName: t.patient.user.full_name,
                    avatar: t.patient.user.full_name.charAt(0).toUpperCase(),
                    isOnline: false,
                    lastMessage: t.messages.length > 0 ? t.messages[0].message_text : "No messages yet",
                    lastMessageTime: t.messages.length > 0 ? t.messages[0].sent_at : t.created_at,
                    unreadCount: 0,
                    primaryCondition: "Patient"
                }));

                const existingPatientIds = new Set(data.threads.map((t: any) => t.patient_id.toString()));
                const contactThreads = data.contacts
                    .filter((c: any) => !existingPatientIds.has(c.patient_id.toString()))
                    .map((c: any) => ({
                        id: `CONTACT_${c.patient_id}`,
                        patientId: c.patient_id.toString(),
                        patientName: c.user.full_name,
                        avatar: c.user.full_name.charAt(0).toUpperCase(),
                        isOnline: false,
                        lastMessage: "Start a conversation",
                        lastMessageTime: new Date().toISOString(),
                        unreadCount: 0,
                        primaryCondition: "Patient"
                    }));

                setChats([...existingThreads, ...contactThreads]);
                setLoading(false);
            }
        } catch (e) {
            console.error('Error fetching threads:', e);
            setLoading(false);
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchThreads();
    }, []);

    // Fetch messages for active chat
    const fetchMessages = async (threadId: string) => {
        if (!threadId || threadId.startsWith('CONTACT_')) return;
        try {
            const res = await fetch(`/api/chat/${threadId}/messages`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (e) {
            console.error('Error fetching messages:', e);
        }
    };

    // Polling interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeChatId && !activeChatId.startsWith('CONTACT_')) {
            fetchMessages(activeChatId);
            interval = setInterval(() => {
                fetchMessages(activeChatId);
                // silent refresh threads to keep last messages up to date
                fetch('/api/chat/threads').then(res => res.json()).then(data => {
                    if (data.success) {
                        setChats(prev => {
                            const newChats = [...prev];
                            data.threads.forEach((t: any) => {
                                const idx = newChats.findIndex(c => c.id === t.thread_id.toString());
                                if (idx > -1 && t.messages.length > 0) {
                                    newChats[idx].lastMessage = t.messages[0].message_text;
                                    newChats[idx].lastMessageTime = t.messages[0].sent_at;
                                }
                            });
                            return newChats;
                        });
                    }
                }).catch(() => { });
            }, 3000);
        } else {
            setMessages([]);
        }
        return () => clearInterval(interval);
    }, [activeChatId]);

    // Handle sending message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        const text = messageInput.trim();
        setMessageInput(""); // optimistically clear

        if (activeChatId.startsWith('CONTACT_')) {
            try {
                const targetId = activeChatId.replace('CONTACT_', '');
                const res = await fetch('/api/chat/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId })
                });
                const data = await res.json();
                if (data.success) {
                    const newThreadId = data.thread.thread_id.toString();
                    await fetchThreads();
                    setActiveChatId(newThreadId);

                    // now send msg
                    await fetch(`/api/chat/${newThreadId}/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text })
                    });
                    await fetchMessages(newThreadId);
                    fetchThreads();
                }
            } catch (err) {
                console.error(err);
            }
            return;
        }

        try {
            const res = await fetch(`/api/chat/${activeChatId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                setChats(prev => prev.map(c => c.id === activeChatId ? {
                    ...c, lastMessage: text, lastMessageTime: data.message.sent_at
                } : c));
                scrollToBottom();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    // Filter Chat List
    const filteredChats = chats.filter(c => c.patientName.toLowerCase().includes(searchTerm.toLowerCase()));

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
                                            <span className={`text-[10px] shrink-0 font-medium ${isActive || chat.unreadCount > 0 ? 'text-primary' : 'text-text-muted'}`}>
                                                {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true }).replace('about', '').trim()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                                                {chat.lastMessage}
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

                                {messages.map((msg: any, index) => {
                                    const isSelf = msg.sender_user_id.toString() === currentUserId;
                                    const showTime = index === 0 || new Date(msg.sent_at).getTime() - new Date(messages[index - 1].sent_at).getTime() > 1800000; // 30 mins

                                    return (
                                        <motion.div
                                            key={msg.message_id}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            layout
                                            className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                                        >
                                            {showTime && (
                                                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2 mt-4 text-center w-full block">
                                                    {formatMessageTime(msg.sent_at)}
                                                </span>
                                            )}

                                            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group ${isSelf ? 'bg-primary text-white rounded-tr-sm border border-primary/20' : 'bg-white text-text-primary rounded-tl-sm border border-border-light'}`}>

                                                {/* Text Body */}
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>

                                                <div className="flex items-center gap-1.5 mt-1 opacity-60">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelf ? 'text-white/80' : 'text-slate-400'}`}>
                                                        {format(new Date(msg.sent_at), "h:mm a")}
                                                    </span>
                                                    {isSelf && (
                                                        <span>
                                                            <CheckCheck className="w-3 h-3 text-emerald-300" />
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
