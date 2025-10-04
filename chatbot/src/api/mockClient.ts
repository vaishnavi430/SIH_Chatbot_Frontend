import type { QueryRequest, QueryResponse, OCRRequest, OCRResponse } from "./types";

export async function sendQuery(body: QueryRequest): Promise<QueryResponse> {
	const res = await fetch("/api/mock/query", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error("Query failed");
	return res.json();
}

export async function sendOCR(body: OCRRequest): Promise<OCRResponse> {
	const res = await fetch("/api/mock/ocr", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error("OCR failed");
	return res.json();
}


