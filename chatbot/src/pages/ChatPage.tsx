import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Send, Languages, MapPin, Upload, Volume2, Plus, Bot, Flame, Sprout, Waves, Clock, Home, LogOut } from "lucide-react";
import HistoryModal from "../components/HistoryModal";
import { Link } from "react-router-dom";
import { useAppStore } from "../app/store";
import { useSpeechInput, useTTS } from "../app/voice";
import { sendQuery, sendOCR } from "../api/mockClient";
import type { ChatAttachment } from "../api/types";

type Msg = { id: string; role: "user"|"assistant"; text: string; attachments?: ChatAttachment[] };

function useHistory() {
	const [items, setItems] = useState<{ id: string; title: string; date: string }[]>(() => {
		try { const raw = localStorage.getItem("ingres.history"); return raw ? JSON.parse(raw) : []; } catch { return []; }
	});
	function add(title: string) {
		const entry = { id: crypto.randomUUID(), title, date: new Date().toISOString() };
		const next = [entry, ...items].slice(0, 20);
		setItems(next);
		try { localStorage.setItem("ingres.history", JSON.stringify(next)); } catch {}
	}
	return { items, add };
}

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

export default function ChatPage() {
	const { t, i18n } = useTranslation();
    const { language, setLanguage, settings } = useAppStore();
	const [messages, setMessages] = useState<Msg[]>([]);
	const [input, setInput] = useState("");
	const [uploading, setUploading] = useState(false);
	const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const history = useHistory();
    const [openHistory, setOpenHistory] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const { isListening, transcript, start, stop, resetTranscript, supported } = useSpeechInput();
	const tts = useTTS(settings.autoTTS);

	useEffect(() => { i18n.changeLanguage(language); }, [language, i18n]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
    useEffect(() => {
        if (messages.length === 0) {
            const welcome = getWelcome(language);
            const botMsg: Msg = { id: crypto.randomUUID(), role: "assistant", text: welcome };
            setMessages([botMsg]);
            if (settings.autoTTS) tts.speak(welcome, language);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);
	useEffect(() => { if (isListening) setInput(transcript); }, [isListening, transcript]);

    // quick action chips handled by top scroller only; no footer duplicate
    const [outerHeaderHeight, setOuterHeaderHeight] = useState<number>(0);

    useEffect(() => {
        function measure() {
            const outer = document.querySelector('header');
            const oh = outer ? outer.getBoundingClientRect().height : 0;
            setOuterHeaderHeight(Math.round(oh));
        }
        // measure on load and on resize
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Listen for header-dispatched events so Header can control chat actions
    useEffect(() => {
        function openHistoryHandler() { setOpenHistory(true); }
        function newChatHandler() { setMessages([]); }
        window.addEventListener('ingres:openHistory', openHistoryHandler as EventListener);
        window.addEventListener('ingres:newChat', newChatHandler as EventListener);
        return () => {
            window.removeEventListener('ingres:openHistory', openHistoryHandler as EventListener);
            window.removeEventListener('ingres:newChat', newChatHandler as EventListener);
        };
    }, []);

	async function onSend(text?: string) {
		const content = (text ?? input).trim();
		if (!content) return;
		const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: content, attachments };
		setMessages(m => [...m, userMsg]);
		setInput("");
		setAttachments([]);
		try {
			const res = await sendQuery({ text: content, language });
			const botMsg: Msg = { id: crypto.randomUUID(), role: "assistant", text: res.text };
			setMessages(m => [...m, botMsg]);
			history.add(content);
			if (settings.autoTTS) tts.speak(res.text, language);
		} catch (e) {
			setMessages(m => [...m, { id: crypto.randomUUID(), role: "assistant", text: t("errors.offline") }]);
		}
	}

	async function onFiles(files: FileList | null) {
		if (!files || !files.length) return;
		setUploading(true);
		const file = files[0];
		const blobUrl = URL.createObjectURL(file);
		try {
			const ocr = await sendOCR({ fileName: file.name, blobUrl, languageHint: language });
			const att: ChatAttachment = { id: crypto.randomUUID(), kind: "image", name: file.name, url: blobUrl, textSnippet: ocr.text };
			setAttachments([att]);
			setInput(prev => prev ? prev : ocr.text);
		} catch {}
		setUploading(false);
	}

    return (
        <div className="min-h-screen flex flex-col font-body">
            <main className="relative flex-1 w-full px-4 pb-28 space-y-6 mt-2 overflow-hidden flex flex-col" style={{ paddingTop: outerHeaderHeight + 8 }}>
                <div className="flex-1 overflow-y-auto pr-1" style={{ paddingTop: outerHeaderHeight + 12 }}>
                    {messages.map(m => (
                        <div key={m.id} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                            {m.role === "assistant" ? (
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center"><Bot className="w-5 h-5" /></div>
                            ) : null}
                                <div className={`max-w-[98vw] card px-3 py-3 ${m.role === "user" ? "bg-primary text-white ml-auto" : ""}`} style={m.role === "user" ? { color: "white", whiteSpace: "pre-wrap" } : { whiteSpace: "pre-wrap" }}>
                                    <p className="text-lg leading-relaxed">{m.text}</p>
                                    {m.attachments?.length ? (
                                        <div className="mt-2 text-sm opacity-80">
                                            {m.attachments.map(a => (
                                                <div key={a.id} className="flex items-center gap-2">
                                                    {a.url ? <img src={a.url} alt={a.name} className="w-16 h-16 object-cover rounded" /> : null}
                                                    <div>{a.textSnippet}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    {m.role === "assistant" ? (
                                        <button aria-label="Play" className="mt-2 btn" onClick={() => tts.speak(m.text)}>
                                            <Volume2 className="w-5 h-5" />
                                        </button>
                                    ) : null}
                                </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />

                </div>
            </main>
            <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} items={history.items} />

            <div className="px-4 md:px-8 w-full">
                <div className="flex flex-wrap items-center gap-3 pb-2 justify-center w-full">
                    <button className="btn bg-white whitespace-nowrap max-w-[240px] truncate"><Flame className="w-5 h-5" /> Groundwater Level</button>
                    <button className="btn bg-white whitespace-nowrap max-w-[240px] truncate"><Sprout className="w-5 h-5" /> Recommended Crops</button>
                    <button className="btn bg-white whitespace-nowrap max-w-[240px] truncate"><Waves className="w-5 h-5" /> Soil Type</button>
                    <button className="btn bg-white whitespace-nowrap max-w-[240px] truncate"><MapPin className="w-5 h-5" /> Nearby Labs</button>
                    <button className="btn bg-white whitespace-nowrap max-w-[240px] truncate"><Sprout className="w-5 h-5" /> Irrigation Tips</button>
                    <button className="btn bg-white whitespace-nowrap max-w-[240px] truncate"><Flame className="w-5 h-5" /> Weather Info</button>
                </div>
            </div>

            <footer className="sticky bottom-0 z-10 border-t px-4 md:px-6 py-4 bg-bg/95 backdrop-blur">
                <div className="flex items-center gap-3">
                    <label className="btn h-12 w-12 grid place-items-center" aria-label="Upload">
                        <Upload className="w-5 h-5" />
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => onFiles(e.target.files)} />
                    </label>
                    <div className="relative flex-1">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onFocus={() => { if (messages.length === 0) { const txt = getWelcome(language); if (settings.autoTTS) tts.speak(txt, language); } }}
                            placeholder={"Tap to speak or type..."}
                            className="w-full h-12 rounded-2xl border pl-4 pr-12 bg-white overflow-hidden"
                            aria-label="Type message"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-white grid place-items-center shadow-soft" onClick={() => onSend()} aria-label="Send">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="rounded-full bg-primary text-white h-14 w-14 grid place-items-center shadow-soft" onClick={() => onSend()} aria-label={t("actions.send")}>
                        <Mic className="w-6 h-6" />
                    </button>
                </div>
            {uploading ? <div className="mt-2 text-sm text-muted">{t("ocr.extracting")}</div> : null}
			</footer>
		</div>
	);
}


