import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Send, Languages, MapPin, Upload, Volume2, Bot, Flame, Sprout, Waves, Loader2, StopCircle } from "lucide-react";
import HistoryModal from "../components/HistoryModal";
import { Link } from "react-router-dom";
import { useAppStore } from "../app/store";
import { useSpeechInput, useTTS } from "../app/voice";
import { sendQuery, sendOCR } from "../api/mockClient";
import type { ChatAttachment } from "../api/types";

// --- Types and Utility Functions (Keep these outside the component for cleanliness) ---

type Msg = { id: string; role: "user" | "assistant"; text: string; attachments?: ChatAttachment[] };

/**
 * Custom hook for managing chat history in localStorage.
 */
function useHistory() {
    const [items, setItems] = useState<{ id: string; title: string; date: string }[]>(() => {
        try { const raw = localStorage.getItem("ingres.history"); return raw ? JSON.parse(raw) : []; } catch { return []; }
    });
    /** Adds a new entry to the history, keeping the list capped at 20. */
    function add(title: string) {
        const entry = { id: crypto.randomUUID(), title, date: new Date().toISOString() };
        const next = [entry, ...items].slice(0, 20);
        setItems(next);
        try { localStorage.setItem("ingres.history", JSON.stringify(next)); } catch { /* Ignore storage errors */ }
    }
    return { items, add };
}

/**
 * Returns the localized welcome message.
 */
function getWelcome(lang: string) {
    const map: Record<string, string> = {
    en: "Hello! I'm INGRES, your groundwater and soil assistant. How can I help you today?",
    hi: "नमस्ते! मैं INGRES हूँ, आपका भूजल और मिट्टी सहायक। मैं आपकी कैसे मदद कर सकता हूँ?",
    mr: "नमस्कार! मी INGRES, तुमचा भूजल आणि माती सहाय्यक. मी कशी मदत करू?",
    gu: "નમસ્તે! હું INGRES, તમારો ભૂગર્ભજળ અને માટી સહાયક. હું કેવી મદદ કરી શકું?",
    pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ INGRES, ਤੁਹਾਡਾ ਭੂਗਰਭ ਜਲ ਅਤੇ ਮਿੱਟੀ ਸਹਾਇਕ ਹਾਂ. ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    bn: "হ্যালো! আমি INGRES, আপনার ভূগর্ভস্থ জল ও মাটি সহকারী। আমি কীভাবে সাহায্য করতে পারি?",
    ta: "வணக்கம்! நான் INGRES, உங்கள் நிலத்தடி நீர் & மண் உதவியாளர். என்ன உதவி வேண்டும்?",
    te: "హలో! నేను INGRES, మీ భూగర్భజల & మట్టి సహాయకుడు. నేను ఎలా సహాయపడగలను?",
    kn: "ನಮಸ್ಕಾರ! ನಾನು INGRES, ನಿಮ್ಮ ಭೂಗರ್ಭಜಲ ಮತ್ತು ಮಣ್ಣು ಸಹಾಯಕ. ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    ml: "നമസ്കാരം! ഞാൻ INGRES, നിങ്ങളുടെ ഭൂഗർഭജലം & മണ്ണ് അസിസ്റ്റന്റ്. എങ്ങനെ സഹായിക്കാം?"
    };
    return map[lang] ?? map.en;
}

// --- Main Component ---

export default function ChatPage() {
    const { t, i18n } = useTranslation();
    const { language, setLanguage, settings } = useAppStore();
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // New: Bot is thinking
    const [error, setError] = useState<string | null>(null); // New: General error state
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const history = useHistory();
    const [openHistory, setOpenHistory] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { isListening, transcript, start, stop, resetTranscript, supported } = useSpeechInput();
    const tts = useTTS(settings.autoTTS);
    const isSending = useMemo(() => isTyping || uploading, [isTyping, uploading]);

    // --- Effects for Initialization and UI updates ---

    // Sync i18n with app language store
    useEffect(() => { i18n.changeLanguage(language); }, [language, i18n]);

    // Scroll to the latest message
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, isTyping]);

    // Display welcome message on mount/language change if chat is empty
    useEffect(() => {
        if (!messages.length) {
            const welcome = getWelcome(language);
            const botMsg: Msg = { id: crypto.randomUUID(), role: "assistant", text: welcome };
            setMessages([botMsg]);
            if (settings.autoTTS) tts.speak(welcome, language);
        }
    }, [language, messages.length, settings.autoTTS, tts]);

    // Update input with speech transcript while listening
    useEffect(() => { 
        if (isListening) setInput(transcript); 
    }, [isListening, transcript]);

    // Auto-send message when listening stops, if there's a transcript
    useEffect(() => {
        // Condition: Speech recognition just stopped, and we have non-empty input from the transcript
        if (!isListening && transcript && transcript.trim() && input === transcript) {
            onSend(transcript);
            resetTranscript(); // Clear the transcript state
        }
    }, [isListening, transcript, input]); // Dependencies: only re-run when these change

    // Header height calculation for main content padding
    const [outerHeaderHeight, setOuterHeaderHeight] = useState<number>(0);
    useEffect(() => {
        function measure() {
            const outer = document.querySelector('header');
            const oh = outer ? outer.getBoundingClientRect().height : 0;
            setOuterHeaderHeight(Math.round(oh));
        }
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Listen for header-dispatched events
    useEffect(() => {
        function openHistoryHandler() { setOpenHistory(true); }
        function newChatHandler() { 
            setMessages([]); 
            setError(null); 
            setIsTyping(false);
            setUploading(false);
        }
        window.addEventListener('ingres:openHistory', openHistoryHandler as EventListener);
        window.addEventListener('ingres:newChat', newChatHandler as EventListener);
        return () => {
            window.removeEventListener('ingres:openHistory', openHistoryHandler as EventListener);
            window.removeEventListener('ingres:newChat', newChatHandler as EventListener);
        };
    }, []);

    // --- Action Handlers ---

    async function onSend(text?: string) {
        const content = (text ?? input).trim();
        if (!content || isSending) return;

        setError(null);
        setIsTyping(true); // Start thinking state

        const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: content, attachments };
        setMessages(m => [...m, userMsg]);
        setInput("");
        setAttachments([]);

        try {
            // Simulate API call for bot's response
            const res = await sendQuery({ text: content, language }); 
            
            const botMsg: Msg = { id: crypto.randomUUID(), role: "assistant", text: res.text };
            setMessages(m => [...m, botMsg]);
            history.add(content);

            if (settings.autoTTS) tts.speak(res.text, language);
        } catch (e) {
            console.error("Query failed:", e);
            const errMsg = t("errors.offline");
            setError(errMsg);
            setMessages(m => [...m, { id: crypto.randomUUID(), role: "assistant", text: errMsg }]);
        } finally {
            setIsTyping(false); // End thinking state
        }
    }

    async function onFiles(files: FileList | null) {
        if (!files || !files.length || isSending) return;
        
        setError(null);
        setUploading(true);
        const file = files[0];
        const blobUrl = URL.createObjectURL(file);

        // Define temporary attachment and user message
        const tempAttachment: ChatAttachment = { id: crypto.randomUUID(), kind: "image", name: file.name, url: blobUrl, textSnippet: "" };
        const userMsg: Msg = { 
            id: crypto.randomUUID(), 
            role: "user", 
            text: input || `Processing image: ${file.name}...`, 
            attachments: [tempAttachment] 
        };

        setMessages(m => [...m, userMsg]);
        setInput("");
        
        try {
            const ocr = await sendOCR({ fileName: file.name, blobUrl, languageHint: language });
            // Create the final attachment object with OCR text snippet
            const att: ChatAttachment = { ...tempAttachment, textSnippet: ocr.text };

            // Update the last message with the OCR text and final attachment state
            setMessages(m => m.map(msg => 
                msg.id === userMsg.id 
                    // FIX: Replaced 'content' with a safe fallback (ocr.text or userMsg.text)
                    ? { ...msg, text: ocr.text || userMsg.text, attachments: [att] } 
                    : msg
            ));
            
            // Set the extracted text as the current input, ready to be sent
            setInput(ocr.text || ""); 
            setAttachments([att]); // Keep attachment state for the next send

        } catch (err) {
            console.error("OCR failed:", err);
            const errMsg = t("errors.ocr");
            setError(errMsg);
            // Revert the last message to an error state or remove it if better UX
            setMessages(m => m.slice(0, -1)); 
            setMessages(m => [...m, { id: crypto.randomUUID(), role: "assistant", text: errMsg }]);
        }

        setUploading(false);
    }

    function toggleSpeechInput() {
        if (isListening) {
            stop();
        } else if (supported && !isSending) {
            start();
        }
    }

    const inputPlaceholder = isListening 
        ? t("actions.listening") + "..." 
        : isTyping 
        ? t("actions.typing") + "..."
        : t("actions.type_or_speak"); // Assuming you add this translation key
    
    // --- Render Content ---

    return (
        <div className="min-h-screen flex flex-col font-body">
            
            <main 
                className="relative flex-1 w-full px-4 pb-5 space-y-6 overflow-hidden flex flex-col" 
                style={{ paddingTop: outerHeaderHeight + 8 }}
                aria-live="polite" // Accessibility for message updates
            >
                <div 
                    className="flex-1 overflow-y-auto pr-1 pb-4" 
                    style={{ paddingTop: outerHeaderHeight + 12 }}
                >
                    {messages.map(m => (
                        <div 
                            key={m.id} 
                            className={`flex items-start gap-3 my-2 ${m.role === "user" ? "justify-end" : ""}`}
                        >
                            {m.role === "assistant" ? (
                                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center mt-1">
                                    <Bot className="w-5 h-5" />
                                </div>
                            ) : null}
                                <div 
                                    className={`max-w-[80%] card px-3 py-3 shadow-md ${
                                        m.role === "user" 
                                            ? "bg-primary text-white ml-auto rounded-bl-xl rounded-tr-xl rounded-tl-xl" 
                                            : "bg-white text-gray-800 rounded-br-xl rounded-tr-xl rounded-tl-xl"
                                    }`} 
                                    style={m.role === "user" ? { color: "white", whiteSpace: "pre-wrap" } : { whiteSpace: "pre-wrap" }}
                                >
                                    <p className="text-lg leading-relaxed">{m.text}</p>
                                    {/* Attachment Display */}
                                    {m.attachments?.length ? (
                                        <div className="mt-2 text-sm opacity-90 border-t pt-2 border-white/30">
                                            {m.attachments.map(a => (
                                                <div key={a.id} className="flex items-center gap-2 mt-1">
                                                    {a.kind === "image" && a.url ? 
                                                        <img src={a.url} alt={a.name} className="w-16 h-16 object-cover rounded-md border border-gray-200" /> 
                                                    : null}
                                                    {a.textSnippet ? <div className="italic text-xs opacity-70">"{a.textSnippet.substring(0, 50)}..."</div> : null}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    {/* TTS Button */}
                                    {m.role === "assistant" && m.text !== t("errors.offline") ? (
                                        <button 
                                            aria-label="Play message" 
                                            className="mt-2 btn btn-xs p-1 bg-primary text-white border-0 hover:bg-primary/80" 
                                            onClick={() => tts.speak(m.text)}
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    ) : null}
                                </div>
                        </div>
                    ))}
                    
                    {/* Bot Typing Indicator */}
                    {isTyping && (
                        <div className="flex items-start gap-3 my-2">
                            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center mt-1">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="card px-3 py-3 bg-white text-gray-800 rounded-br-xl rounded-tr-xl rounded-tl-xl shadow-md">
                                <div className="flex items-center space-x-1">
                                    <span className="animate-pulse w-2 h-2 bg-primary rounded-full"></span>
                                    <span className="animate-pulse delay-150 w-2 h-2 bg-primary rounded-full"></span>
                                    <span className="animate-pulse delay-300 w-2 h-2 bg-primary rounded-full"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </main>
            
            {/* History Modal */}
            <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} items={history.items} />

            {/* Quick Action Chips */}
            <div className="px-4 md:px-8 w-full">
                <div className="flex flex-wrap items-center gap-3 pb-2 justify-center w-full">
                    {[
                        { icon: Flame, text: "Groundwater Level", query: "What is the groundwater level in my area?" },
                        { icon: Sprout, text: "Recommended Crops", query: "Which crops are recommended for my soil and season?" },
                        { icon: Waves, text: "Soil Type", query: "What is the soil type in my location?" },
                        { icon: MapPin, text: "Nearby Labs", query: "Show me nearby soil and water testing labs." },
                        { icon: Sprout, text: "Irrigation Tips", query: "Give me irrigation tips for my crops." },
                        { icon: Flame, text: "Weather Info", query: "What is the latest weather information for my area?" },
                    ].map(({ icon: Icon, text, query }) => (
                        <button
                            key={text}
                            className="btn bg-white whitespace-nowrap max-w-[240px] truncate transition-transform hover:scale-[1.02]"
                            onClick={() => onSend(query)}
                            disabled={isSending}
                        >
                            <Icon className="w-5 h-5" /> {text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Footer */}
            <footer className="sticky bottom-0 z-10 border-t px-4 md:px-6 py-4 bg-bg/95 backdrop-blur">
                {/* Upload/Error Status */}
                {(uploading || error) && (
                    <div className="mb-2 text-center text-sm">
                        {uploading ? (
                            <span className="text-primary flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> {t("ocr.extracting")}
                            </span>
                        ) : error ? (
                            <span className="text-red-500">{error}</span>
                        ) : null}
                    </div>
                )}
                
                <div className="flex items-end gap-3">
                    {/* Upload Button */}
                    <label className={`btn h-12 w-12 grid place-items-center flex-shrink-0 transition-colors ${isSending ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100"}`} aria-label="Upload">
                        <Upload className="w-5 h-5" />
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf" 
                            onChange={e => onFiles(e.target.files)}
                            disabled={isSending}
                        />
                    </label>
                    
                    {/* Input Field */}
                    <div className="relative flex-1 min-w-0">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) onSend(); }} // Send on Enter key
                            onFocus={() => { if (!messages.length) { const txt = getWelcome(language); if (settings.autoTTS) tts.speak(txt, language); } }}
                            placeholder={inputPlaceholder}
                            className="w-full h-12 rounded-2xl border pl-4 pr-12 bg-white overflow-hidden text-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:bg-gray-100"
                            aria-label="Type message"
                            disabled={isSending}
                        />
                        {/* Send Button */}
                        <button 
                            className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full grid place-items-center shadow-soft transition-colors ${
                                input.trim() && !isSending 
                                    ? "bg-primary text-white hover:bg-primary/90" 
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`} 
                            onClick={() => onSend()} 
                            aria-label="Send message"
                            disabled={!input.trim() || isSending}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Voice Input Button */}
                    <button 
                        className={`h-12 w-12 flex-shrink-0 rounded-full grid place-items-center shadow-soft transition-all ${
                            isListening 
                                ? "bg-red-500 text-white animate-pulse" 
                                : supported && !isSending 
                                ? "bg-primary text-white hover:scale-105"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`} 
                        onClick={toggleSpeechInput} 
                        aria-label={isListening ? t("actions.stop_voice") : t("actions.voice")}
                        disabled={!supported || isSending}
                    >
                        {isListening ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                </div>
            </footer>
        </div>
    );
}
