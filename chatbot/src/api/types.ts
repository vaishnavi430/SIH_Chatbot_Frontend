export type LanguageCode = "en"|"hi"|"mr"|"gu"|"pa"|"bn"|"ta"|"te"|"kn"|"ml";

export interface ChatAttachment {
	id: string;
	kind: "image" | "pdf" | "text";
	name: string;
	url?: string;
	textSnippet?: string;
}

export interface QueryRequest {
	text: string;
	language: LanguageCode;
	region?: string;
	attachments?: ChatAttachment[];
}

export interface QueryResponse {
	text: string;
	tts: boolean;
	attachments: ChatAttachment[];
	suggested_actions: string[];
	region?: string;
	meta?: { groundwaterLevel?: string; soilType?: string };
}

export interface OCRRequest {
	fileName: string;
	blobUrl: string;
	languageHint?: LanguageCode;
}

export interface OCRResponse {
	text: string;
	confidence: number;
}




