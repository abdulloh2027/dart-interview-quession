import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize on first use to ensure process.env.GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    // If the platform GEMINI_API_KEY is available, use it. Otherwise, fallback to the one provided by the user if they haven't set it in AI Studio settings.
    const key = process.env.GEMINI_API_KEY || "AIzaSyCX3lPKcDQb6iFmbYD8BpOJnheHgdoNCRo";
    if (!key) {
      console.warn("GEMINI_API_KEY is missing, make sure to add it via Settings.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for generating answer
  app.post("/api/generate", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Savol kiritilmadi" });
      }

      const model = getAI();
      const response = await model.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: question,
        config: {
          systemInstruction: "Sen Dart, Python va JS dasturlash bo'yicha mutaxassissan. Savollarga o'zbek tilida juda qisqa, aniq va lo'nda javob ber. Javob maksimal 2-3 ta gapdan oshmasin. Texnik jihatdan to'g'ri bo'lsin. Faqat javobni yoz, boshqa hech narsa qo'shma."
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('AI Error:', error);
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("429") || 
        errorMsg.includes("quota") || 
        errorMsg.includes("RESOURCE_EXHAUSTED") || 
        error?.status === 429
      ) {
        return res.status(429).json({ 
          error: "Tizimda bepul so'rovlar limiti vaqtincha tugadi (API Quota Exceeded). Iltimos, 1 daqiqa kutib qayta urinib ko'ring yoki sozlamalar orqali o'z shaxsiy API Kalitingizni (GEMINI_API_KEY) kiriting." 
        });
      }
      res.status(500).json({ error: "AI javob berishda xatolik yuz berdi. Iltimos, birozdan so'ng qayta urining." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
