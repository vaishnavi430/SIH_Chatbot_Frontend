import { setupWorker, rest } from "msw";
import type { QueryRequest, OCRRequest } from "@/api/types";

const worker = setupWorker(
	rest.post("/api/mock/query", async (req, res, ctx) => {
		const body = (await req.json()) as QueryRequest;
		const responses: Record<string, string> = {
			en: "Your groundwater level is 12.4 m below ground. Recommended: planting millet now; use drip irrigation. Want soil test labs nearby?",
			hi: "आपका भूमिगत जल स्तर 12.4 मीटर है। सुझाव: मिलेट (बाजरा) लगाएँ; ड्रिप सिंचाई का उपयोग करें। क्या पास के लैब देखें?",
			mr: "तुमचा भूजल स्तर जमिनीखालून 12.4 मीटर आहे. सल्ला: बाजरी लावा; ड्रिप सिंचन वापरा. जवळचे प्रयोगशाळा पाहू का?",
			gu: "તમારો ભૂગર્ભ જળ સ્તર જમીનથી 12.4 મીટર છે. સલાહ: બાજરી વાવો; ડ્રિપ સિંચાઈ કરો. નજીકની લેબ્સ જોઈએ?",
			pa: "ਤੁਹਾਡਾ ਭੂਗਰਭ ਜਲ ਪੱਧਰ 12.4 ਮੀਟਰ ਹੈ। ਸਲਾਹ: ਬਾਜਰਾ ਲਗਾਓ; ਡ੍ਰਿਪ ਸਿੰਚਾਈ ਵਰਤੋ। ਨੇੜਲੇ ਲੈਬ ਵੇਖੀਏ?",
			bn: "আপনার ভূগর্ভস্থ জলের স্তর মাটি থেকে 12.4 মিটার। পরামর্শ: মিলেট চাষ করুন; ড্রিপ সেচ ব্যবহার করুন। আশেপাশের ল্যাব দেখব?",
			ta: "உங்கள் நிலத்தடி நீர்மட்டம் 12.4 மீ. ஆலோசனை: கம்பு நடவு செய்யவும்; டிரிப் பாசனம் பயன்படுத்தவும். அருகிலுள்ள ஆய்வகங்களை பார்க்கவா?",
			te: "మీ భూగర్భ జల స్థాయి నేల దిగువ 12.4 మీ. సలహా: బాజ్రా వేసండి; డ్రిప్ సాగు వాడండి. దగ్గర్లో ల్యాబ్స్ చూడాలా?",
			kn: "ನಿಮ್ಮ ಭೂಗರ್ಭ ಜಲಮಟ್ಟ 12.4 ಮೀ. ಸಲಹೆ: ಸಜ್ಜೆ ನೆಡಿ; ಡ್ರಿಪ್ ನೀರಾವರಿ ಬಳಸಿ. ಹತ್ತಿರದ ಲ್ಯಾಬ್‌ಗಳನ್ನು ನೋಡೋಣವೇ?",
			ml: "നിങ്ങളുടെ ഭൂഗർഭ ജലനിരപ്പ് 12.4 മീറ്റർ. നിർദേശം: കാമ്പ് നട്ട് ഡ്രിപ്പ് ഇറിഗേഷൻ ഉപയോഗിക്കുക. അടുത്ത ലാബുകൾ കാണട്ടേ?"
		};
		return res(
			ctx.status(200),
			ctx.json({
				text: responses[body.language] ?? responses.en,
				tts: true,
				attachments: [],
				suggested_actions: ["Groundwater level", "Soil type", "Recommended crops", "Irrigation tips"],
				region: body.region ?? "Unknown",
				meta: { groundwaterLevel: "12.4 m" }
			})
		);
	}),

	rest.post("/api/mock/ocr", async (req, res, ctx) => {
		const body = (await req.json()) as OCRRequest;
		const text = body.languageHint === "hi" ? "प्रकार: दोमट, जल-धारण: मध्यम" : "Type: Loam, Water holding: Medium";
		return res(ctx.status(200), ctx.json({ text, confidence: 0.86 }));
	})
);

export async function startMocks() {
	if (typeof window === "undefined") return;
	try {
		await worker.start({ onUnhandledRequest: "bypass" });
	} catch (err) {
		// If mockServiceWorker.js is missing, don't break the UI
		console.warn("MSW failed to start; continuing without mocks", err);
	}
}


