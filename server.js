console.log("SERVER.JS ISHGA TUSHDI");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// TEST AI saytini ochish
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// AI orqali test yaratish
app.post("/api/generate-test", async (req, res) => {
    try {
        const {
            className,
            subject,
            topic,
            difficulty,
            questionCount
        } = req.body;

        if (!className || !subject || !topic || !difficulty) {
            return res.status(400).json({
                error: "Test sozlamalari to'liq yuborilmadi."
            });
        }

        const prompt = `
Sen TEST AI uchun test savollari yaratuvchi AI'san.

Sinf: ${className}
Fan: ${subject}
Mavzu: ${topic}
Qiyinlik: ${difficulty}
Savollar soni: ${questionCount || 10}

Shu ma'lumotlarga mos test yarat.

Har bir savolda:
- question
- answers
- correct

bo'lsin.

answers aynan 4 ta variantdan iborat bo'lsin.

correct 0, 1, 2 yoki 3 bo'lsin.
Bu raqam to'g'ri javobning answers ichidagi indeksini bildiradi.

Faqat JSON qaytar.
Markdown yozma.
Izoh yozma.

Format:

{
  "questions": [
    {
      "question": "Savol",
      "answers": [
        "Variant A",
        "Variant B",
        "Variant C",
        "Variant D"
      ],
      "correct": 0
    }
  ]
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });

        const text = response.text;

        console.log("GEMINI JAVOBI:");
        console.log(text);

        // Agar Gemini ```json ... ``` ko'rinishida yuborsa,
        // ularni olib tashlaymiz
        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const result = JSON.parse(cleanText);

        res.json(result);

    } catch (error) {
        console.error("GEMINI XATOSI:", error);

        res.status(500).json({
            error: "AI test yaratishda xatolik yuz berdi.",
            details: error.message
        });
    }
});

app.listen(3000, () => {
    console.log("SERVER 3000 PORTDA ISHLAYAPTI");
});