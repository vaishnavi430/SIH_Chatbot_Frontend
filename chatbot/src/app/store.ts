import { create } from "zustand";
import type { LanguageCode } from "@/api/types";

type Settings = { autoTTS: boolean; bigText: boolean };

type AppState = {
	language: LanguageCode;
	region?: string;
	settings: Settings;
	setLanguage: (lng: LanguageCode) => void;
	setRegion: (r?: string) => void;
	setSettings: (s: Partial<Settings>) => void;
};

const LS_SETTINGS = "ingres.settings";

function loadSettings(): { language: LanguageCode; settings: Settings } {
	try {
		const raw = localStorage.getItem(LS_SETTINGS);
		if (raw) return JSON.parse(raw);
	} catch {}
	return { language: "en", settings: { autoTTS: true, bigText: false } };
}

export const useAppStore = create<AppState>(set => {
	const { language, settings } = loadSettings();
	return {
		language,
		region: undefined,
		settings,
		setLanguage: lng => {
			set(state => {
				persist({ ...state, language: lng });
				return { language: lng } as Partial<AppState>;
			});
		},
		setRegion: r => set({ region: r }),
		setSettings: s => {
			set(state => {
				const merged = { ...state.settings, ...s };
				persist({ ...state, settings: merged });
				return { settings: merged } as Partial<AppState>;
			});
		}
	};
});

function persist(state: AppState) {
	try {
		localStorage.setItem(LS_SETTINGS, JSON.stringify({ language: state.language, settings: state.settings }));
	} catch {}
}




