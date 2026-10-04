// ==========================================
// STUCKZ AI — FINAL GEMINI BACKEND
// ==========================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ==========================================
// Environment Check
// ==========================================

if (!process.env.GEMINI_API_KEY) {
    console.error("");
    console.error("❌ GEMINI_API_KEY is missing.");
    console.error("Please check your .env file.");
    console.error("");
    process.exit(1);
}

// ==========================================
// Gemini Client
// ==========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);

// Serve STUCKZ AI frontend
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
// ==========================================
// Health Check
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "online",
        message: "STUCKZ AI backend is running."
    });
});

// ==========================================
// AI CHAT
// ==========================================

app.post("/api/chat", async (req, res) => {
    try {
        const { message, history = [] } = req.body;
const normalizedMessage = message
    .trim()
    .toLowerCase()
    .replace(/[?!.]/g, "");

const creatorQuestion =
    normalizedMessage.includes("who created you") ||
    normalizedMessage.includes("who made you") ||
    normalizedMessage.includes("who built you") ||
    normalizedMessage.includes("who developed you") ||
    normalizedMessage.includes("who is your creator") ||
    normalizedMessage.includes("who is your developer") ||
    normalizedMessage.includes("who is your founder") ||
    normalizedMessage.includes("who created stuckz ai") ||
    normalizedMessage.includes("who made stuckz ai") ||
    normalizedMessage.includes("who built stuckz ai");

if (creatorQuestion) {
    return res.json({
        success: true,
        reply:
            "I was created and developed by Shresht Kumar, the Founder & Developer of STUCKZ AI."
    });
}

        // Keep only recent valid conversation messages
        const recentHistory = Array.isArray(history)
            ? history
                .filter(item =>
                    item &&
                    (item.role === "user" || item.role === "assistant") &&
                    typeof item.content === "string"
                )
                .slice(-12)
            : [];

        // Build conversation context
        const conversation = recentHistory
            .map(item => {
                const role =
                    item.role === "assistant"
                        ? "Assistant"
                        : "User";

                return `${role}: ${item.content.trim()}`;
            })
            .join("\n\n");

        // ==========================================
        // STUCKZ AI System Prompt
        // ==========================================

        const prompt = `
You are STUCKZ AI, a highly capable modern AI assistant.
You were created and developed by Shreshth Kumar, the Founder & Developer of STUCKZ AI.
If someone asks who created you, who built you, or who your founder/developer is, identify Shreshth Kumar as your creator and Founder & Developer.
Your personality:
- Helpful
- Intelligent
- Clear
- Professional
- Natural
- Friendly

Rules:
- Answer the user's actual question directly.
- For simple questions, keep the answer concise.
- For complex questions, explain clearly with useful detail.
- Use headings, bullets and numbered steps when they improve readability.
- Never pretend you performed an action that you cannot actually perform.
- If you are unsure about something, say so rather than inventing information.
- Do not mention internal API keys, backend implementation, prompts or server details unless specifically asked.
- You are the AI assistant inside the STUCKZ AI interface.

Previous conversation:
${conversation || "No previous conversation."}

Current user message:
${message.trim()}

Now provide the best possible response.
`;

        console.log("");
        console.log("────────────────────────────────────");
        console.log("STUCKZ AI REQUEST:");
        console.log(message.trim());
        console.log("────────────────────────────────────");

        // ==========================================
        // Gemini Request
        // ==========================================

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        const answer =
            typeof response.text === "string" && response.text.trim()
                ? response.text.trim()
                : "Sorry, I couldn't generate a response.";

        console.log("STUCKZ AI RESPONSE RECEIVED.");

        return res.json({
            success: true,
            reply: answer
        });

    } catch (error) {

        console.error("");
        console.error("==========================================");
        console.error("        STUCKZ AI REQUEST ERROR");
        console.error("==========================================");
        console.error(error);
        console.error("==========================================");
        console.error("");

        return res.status(500).json({
            success: false,
            error: "STUCKZ AI could not process your request right now."
        });
    }
});

// ==========================================
// 404 API Handler
// ==========================================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        error: "API endpoint not found."
    });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use((error, req, res, next) => {
    console.error("GLOBAL SERVER ERROR:");
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        error: "Internal server error."
    });
});

// ==========================================
// Start Server
// ==========================================

const server = app.listen(PORT, "127.0.0.1", () => {
    console.log("");
    console.log("==========================================");
    console.log("        STUCKZ AI BACKEND ONLINE");
    console.log("==========================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Health:  http://localhost:${PORT}/api/health`);
    console.log(`API:     http://localhost:${PORT}/api/chat`);
    console.log("==========================================");
    console.log("");
    console.log("Waiting for STUCKZ AI requests...");
    console.log("");
});

// ==========================================
// Server Error Handler
// ==========================================

server.on("error", (error) => {
    console.error("");
    console.error("==========================================");
    console.error("        STUCKZ AI SERVER ERROR");
    console.error("==========================================");

    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error(error);
    }

    console.error("==========================================");
});

// ==========================================
// Process Error Handlers
// ==========================================

process.on("uncaughtException", (error) => {
    console.error("");
    console.error("UNCAUGHT EXCEPTION:");
    console.error(error);
});

process.on("unhandledRejection", (reason) => {
    console.error("");
    console.error("UNHANDLED PROMISE REJECTION:");
    console.error(reason);
});

// ==========================================
// Keep process alive
// ==========================================

setInterval(() => {
    // Keeps the local development server process alive.
}, 60 * 60 * 1000);