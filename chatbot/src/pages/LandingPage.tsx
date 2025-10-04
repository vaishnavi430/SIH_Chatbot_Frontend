import { Mic, Upload, Keyboard, ChevronRight, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
	return (
		<div className="min-h-full flex flex-col">
			<div className="w-full px-6 py-12 max-w-full">
				<div className="text-center mb-6 mt-20 sm:mt-24">
					<div className="mx-auto mb-4 w-24 h-24 grid place-items-center rounded-full bg-primary text-white shadow-soft" style={{ position: 'relative', zIndex: 1 }}>
						<Sprout className="w-8 h-8" />
					</div>
					<h2 className="font-heading text-3xl text-primary">Welcome to INGRES</h2>
					<p className="text-muted mt-2">Groundwater & soil assistant for farmers and industry</p>
				</div>
				<section className="card p-4 mb-6">
					<h3 className="font-heading text-xl mb-3 flex items-center gap-2">Select Your Language</h3>
					<select className="w-full rounded-2xl border px-4 py-3 bg-white">
						<option>English (English)</option>
						<option>हिंदी (Hindi)</option>
					</select>
				</section>
				<section className="card p-4 mb-6">
					<h3 className="font-heading text-xl mb-4">Voice Tutorial</h3>
					<ul className="grid gap-3">
						<li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center">1</span> Tap to speak - Hold the microphone button</li>
						<li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center">2</span> Ask about groundwater, soil, or crops</li>
						<li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center">3</span> Listen to the answer or read it</li>
					</ul>
				</section>
				<div className="grid sm:grid-cols-3 gap-3">
					<Link to="/chat" className="btn btn-primary flex items-center justify-center gap-2 text-lg"><Mic className="w-5 h-5" /> Talk to INGRES</Link>
					<Link to="/chat" className="btn flex items-center justify-center gap-2 text-lg"><Upload className="w-5 h-5" /> Upload document</Link>
					<Link to="/chat" className="btn flex items-center justify-center gap-2 text-lg"><Keyboard className="w-5 h-5" /> Type instead</Link>
				</div>
			</div>
		</div>
	);
}




