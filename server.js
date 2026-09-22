const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const PORT = 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));

app.post("/api/generate-test", async (req, res) => {
    try {
        const {
            grade,
            subject,
            topic,
            difficulty,
            questionCount
        } = req.body;

        const prompt = `
TEST AI uchun ${questionCount} ta test savoli yarat.

Sinf: ${grade}
Fan: ${subject}
Mavzu: ${topic}
Qiyinlik: ${difficulty}

Har bir savolda:
- savol
- 4 ta javob
- bitta to'g'ri javob

Faqat quyidagi JSON formatida javob ber:

{
  "questions": [
    {
      "q": "Savol",
      "a": ["A", "B", "C", "D"],
      "correct": 0
    }
  ]
}
`;

        console.log("AI ga so'rov yuborilmoqda...");

        const response = await client.responses.create({
            model: "gpt-5.6-luna",
            input: prompt
        });

        console.log("AI response olindi.");

        let text = response.output_text;

        console.log("AI TEXT:");
        console.log(text);

        if (!text || !text.trim()) {
            throw new Error("AI bo'sh javob qaytardi.");
        }

        // Markdown JSON belgilarini olib tashlash
        text = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        // JSON boshlanishi va tugashini topamiz
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error(
                "AI JSON formatida javob bermadi."
            );
        }

        text = text.substring(start, end + 1);

        const data = JSON.parse(text);

        if (
            !data.questions ||
            !Array.isArray(data.questions)
        ) {
            throw new Error(
                "AI savollar massivini qaytarmadi."
            );
        }

        console.log(
            "Savollar:",
            data.questions.length
        );

        res.json(data);

    } catch (error) {

        console.error("========== AI ERROR ==========");
        console.error(error);
        console.error("==============================");

        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("       TEST AI ISHLAMOQDA");
    console.log("=================================");
    console.log("http://localhost:3000");
    console.log("");
});
