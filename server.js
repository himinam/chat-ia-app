require('dotenv').config();
const API_KEY = process.env.OPENROUTER_API_KEY;
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor OK 🚀");
});

// CHAT PRO
app.post("/chat", async (req, res) => {

    const messages = req.body.messages;

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages
             },
            {
               headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
}
            }
        );

        res.json({
            respuesta: response.data.choices[0].message.content
        });

    } catch (error) {

        console.log(error.response?.data || error.message);

        res.json({
            respuesta: "❌ Error IA"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Servidor iniciado");
});