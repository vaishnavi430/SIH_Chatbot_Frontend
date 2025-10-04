import { useNavigate, Link } from "react-router-dom";
import { Languages, Sprout } from "lucide-react";
import { useAppStore } from "../app/store";

export default function HeaderBar() {
	const nav = useNavigate();
	const { language, setLanguage, settings, setSettings } = useAppStore();

	return (
	<header className="fixed top-0 left-0 right-0 z-50 bg-bg/100/95 backdrop-blur px-4 py-2 flex items-center gap-2 border-b shadow-sm">
			<Link to="/" className="flex items-center gap-2 select-none">
				<div className="w-8 h-8 rounded-full bg-primary grid place-items-center text-white font-heading">
					<Sprout className="w-5 h-5" />
				</div>
				<h1 className="font-heading text-lg uppercase">INGRES</h1>
			</Link>
			<div className="ml-auto flex items-center gap-2">
				<select aria-label="Language" className="h-9 min-w-[150px] rounded-2xl border bg-white px-3 text-sm" value={language} onChange={e => setLanguage(e.target.value as any)}>
					<option value="en">English</option>
					<option value="hi">हिंदी</option>
					<option value="mr">मराठी</option>
					<option value="gu">ગુજરાતી</option>
					<option value="pa">ਪੰਜਾਬੀ</option>
					<option value="bn">বাংলা</option>
					<option value="ta">தமிழ்</option>
					<option value="te">తెలుగు</option>
					<option value="kn">ಕನ್ನಡ</option>
					<option value="ml">മലയാളം</option>
				</select>
				<button className="h-9 rounded-2xl px-3 font-semibold shadow-soft transition bg-white" onClick={() => setSettings({ bigText: !settings.bigText })}>
					<Languages className="w-5 h-5 inline mr-2" /> {settings.bigText ? "Normal" : "Big"}
				</button>
			</div>
		</header>
	);
}


