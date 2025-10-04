import React from "react";

type Item = { id: string; title: string; date: string };

export default function HistoryModal({ open, onClose, items }: { open: boolean; onClose: () => void; items: Item[] }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="absolute inset-x-0 bottom-0 md:inset-y-12 md:mx-auto md:max-w-xl bg-surface rounded-t-2xl md:rounded-2xl shadow-soft p-4">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-heading text-lg">Chat History</h3>
					<button className="btn" onClick={onClose}>Close</button>
				</div>
				<div className="max-h-[60vh] overflow-y-auto">
					{items.length === 0 ? (
						<div className="text-sm text-muted px-2 py-10 text-center">No history yet</div>
					) : (
						<ul className="divide-y">
							{items.map(h => (
								<li key={h.id} className="py-2">
									<div className="font-medium truncate">{h.title}</div>
									<div className="text-xs text-muted">{new Date(h.date).toLocaleString()}</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}




