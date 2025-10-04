import { Link, useNavigate } from "react-router-dom";

export default function AuthSignIn() {
	const nav = useNavigate();
	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		nav("/chat");
	}
	return (
		<div className="min-h-full grid place-items-center px-4 py-8">
			<form onSubmit={onSubmit} className="card w-full max-w-md p-6 grid gap-4">
				<h2 className="font-heading text-2xl">Sign in</h2>
				<input className="rounded-2xl border px-4 py-3" placeholder="Email" type="email" required />
				<input className="rounded-2xl border px-4 py-3" placeholder="Password" type="password" required />
				<button className="btn btn-primary">Continue</button>
				<p className="text-sm text-muted">No account? <Link to="/auth/signup" className="underline">Sign up</Link></p>
			</form>
		</div>
	);
}




