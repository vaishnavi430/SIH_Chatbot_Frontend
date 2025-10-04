import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export function useSpeechInput() {
	const { listening, transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
	const start = async (lang?: string) => {
		try {
			await SpeechRecognition.startListening({ continuous: true, language: lang });
		} catch {}
	};
	const stop = async () => { await SpeechRecognition.stopListening(); };
	return { isListening: listening, transcript, start, stop, resetTranscript, supported: browserSupportsSpeechRecognition };
}

export function useTTS(auto = true) {
    const available = typeof window !== "undefined" && "speechSynthesis" in window;

    function pickVoice(lang: string | undefined) {
        if (!available) return undefined as SpeechSynthesisVoice | undefined;
        const voices = window.speechSynthesis.getVoices();
        if (!voices?.length) return undefined;
        // Prefer exact match, then language-only match (e.g., hi vs hi-IN), then any default voice
        const normalized = (lang || "en").toLowerCase();
        const exact = voices.find(v => v.lang?.toLowerCase() === normalized);
        if (exact) return exact;
        const prefix = voices.find(v => v.lang?.toLowerCase().startsWith(normalized.split("-")[0] + "-"));
        if (prefix) return prefix;
        // Try common regional variants mapping
        const map: Record<string, string[]> = {
            en: ["en-IN", "en-GB", "en-US"],
            hi: ["hi-IN"],
            mr: ["mr-IN", "hi-IN"],
            gu: ["gu-IN", "hi-IN"],
            pa: ["pa-IN", "hi-IN"],
            bn: ["bn-IN", "bn-BD", "hi-IN"],
            ta: ["ta-IN"],
            te: ["te-IN"],
            kn: ["kn-IN"],
            ml: ["ml-IN"]
        };
        const prefs = map[(normalized.split("-")[0])] || [];
        for (const code of prefs) {
            const v = voices.find(x => x.lang?.toLowerCase() === code.toLowerCase());
            if (v) return v;
        }
        return voices.find(v => v.default) || voices[0];
    }

    const speak = (text: string, lang = "en", rate = 1, pitch = 1) => {
        if (!available) return;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = rate; // 0.1 - 10
        u.pitch = pitch; // 0 - 2
        const voice = pickVoice(lang);
        if (voice) u.voice = voice;
        // Cancel any ongoing speech to avoid overlap
        window.speechSynthesis.cancel();
        // Some browsers need voices to be loaded asynchronously
        const maybeSpeak = () => window.speechSynthesis.speak(u);
        const haveVoices = window.speechSynthesis.getVoices()?.length > 0;
        if (haveVoices) {
            maybeSpeak();
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                const v = pickVoice(lang);
                if (v) u.voice = v;
                maybeSpeak();
            };
        }
    };

    const cancel = () => { if (available) window.speechSynthesis.cancel(); };
    return { speak, cancel, available, auto };
}


