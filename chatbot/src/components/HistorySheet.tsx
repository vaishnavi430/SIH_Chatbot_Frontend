import { History } from "lucide-react";

export default function HistorySheet({ items }: { items: { id: string; title: string; date: string }[] }) {
	return (
		<div className="relative group">
			<button className="btn" aria-haspopup="dialog"><History className="w-5 h-5" /> History</button>
			<div className="absolute right-0 mt-2 w-72 max-h-80 overflow-auto card p-2 hidden group-hover:block">
				{items.length === 0 ? <div className="text-sm text-muted px-2 py-6 text-center">No history yet</div> : null}
				{items.map(h => (
					<div key={h.id} className="px-3 py-2 rounded hover:bg-bg">
						<div className="font-medium truncate">{h.title}</div>
						<div className="text-xs text-muted">{new Date(h.date).toLocaleString()}</div>
					</div>
				))}
			</div>
		</div>
	);
}




