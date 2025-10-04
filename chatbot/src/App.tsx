import React, { useEffect, useState, type ReactNode } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import AuthSignIn from "./pages/AuthSignIn";
import AuthSignUp from "./pages/AuthSignUp";
import HeaderBar from "./components/HeaderBar";
import ChatHeader from "./components/ChatHeader";
import { useAppStore } from "./app/store";

export default function App() {
	const bigText = useAppStore(s => s.settings.bigText);
	const location = useLocation();
	const showHeader = true;
	useEffect(() => {
		document.body.style.fontSize = bigText ? "18px" : "16px";
	}, [bigText]);
	return (
		<ErrorBoundary>
			<div className="min-h-full flex flex-col">
				{location.pathname === '/chat' ? <ChatHeader /> : <HeaderBar />}
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/auth/signin" element={<AuthSignIn />} />
					<Route path="/auth/signup" element={<AuthSignUp />} />
					<Route path="/chat" element={<ChatPage />} />
				</Routes>
			</div>
		</ErrorBoundary>
	);
}

function ErrorBoundary(props: { children: ReactNode }) {
  const [error, setError] = useState<unknown>(null);
  return (
    <Boundary onError={setError}>
      {error ? (
        <div style={{ padding: 16 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(error)}</pre>
        </div>
      ) : (
        props.children
      )}
    </Boundary>
  );
}

function Boundary({ children, onError }: { children: ReactNode; onError: (e: unknown) => void }) {
  try {
    return <>{children}</>;
  } catch (e) {
    onError(e);
    return null;
  }
}


