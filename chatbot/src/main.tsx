import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./app/i18n";

// Render first, then lazy-start MSW in dev (non-blocking)

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);

if (import.meta.env.DEV) {
	import("./app/msw").then(m => m.startMocks?.()).catch(() => {});
}


