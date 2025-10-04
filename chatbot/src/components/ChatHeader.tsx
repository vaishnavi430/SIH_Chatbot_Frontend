import { Link, useNavigate } from "react-router-dom";
import { Sprout, MapPin, Languages, Plus, Clock, Home } from "lucide-react";
import { useAppStore } from "../app/store";

export default function ChatHeader() {
  const nav = useNavigate();
  const { language, setLanguage, settings, setSettings } = useAppStore();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/100 px-4 py-2 flex items-center gap-3 border-b shadow-sm">
      <Link to="/" className="flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-full bg-primary grid place-items-center text-white font-heading">
          <Sprout className="w-4 h-4" />
        </div>
        <h1 className="font-heading text-lg uppercase">INGRES</h1>
      </Link>
      <div className="ml-4 text-sm text-muted flex items-center gap-1"><MapPin className="w-4 h-4" /> Sample Region</div>
      <div className="ml-auto flex items-center gap-2">
        <select aria-label="Language" className="h-9 min-w-[140px] rounded-2xl border bg-white px-3 text-sm" value={language} onChange={e => setLanguage(e.target.value as any)}>
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
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-2xl bg-white font-semibold shadow-soft" onClick={() => window.dispatchEvent(new Event('ingres:newChat'))}>
          <Plus className="w-5 h-5" /> New Chat
        </button>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-2xl bg-white font-semibold shadow-soft" onClick={() => window.dispatchEvent(new Event('ingres:openHistory'))}>
          <Clock className="w-5 h-5" /> History
        </button>
        <button className="h-9 rounded-2xl px-3 font-semibold shadow-soft transition bg-white" onClick={() => nav('/') }>
          <Home className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
