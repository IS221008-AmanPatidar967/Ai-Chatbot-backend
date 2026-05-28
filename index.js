const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ========================
// TEST ROUTE
// ========================

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});


// ========================
// GEMINI SETUP
// ========================

const genAI = new GoogleGenerativeAI(
  process.env.API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest", // KEEP SAME
});


// ========================
// SYSTEM PROMPT
// ========================

const SYSTEM_PROMPT = `
You are an intelligent AI assistant.

Rules:
- Give clean formatted responses
- No unnecessary emojis
- No repeated sentences
- Answer directly
- Explain simply
- Use headings and bullet points
- Keep answers human-like
- Never generate gibberish
- Provide small small Diagrams  not always when needed
- make more user friendly and interactive
provide code snippets when needed and explain them simply
  please make sure to follow the above rules strictly while generating responses.

`;


// ========================
// GENERATE FUNCTION
// ========================

const generate = async (
  prompt,
  history = []
) => {

  try {

    // FORMAT HISTORY
    const formattedHistory =
      history
        .map(
          (msg) =>
            `${msg.role}: ${msg.content}`
        )
        .join("\n");


    // FINAL PROMPT
    const finalPrompt = `
${SYSTEM_PROMPT}

Conversation:
${formattedHistory}

User:
${prompt}

Assistant:
`;

    const result =
      await model.generateContent(
        finalPrompt
      );

    let response =
      result.response.text();


    // CLEAN RESPONSE
    response = response
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return response;

  } catch (err) {

    console.log(err);

    return "Error generating response";

  }

};


// ========================
// API ROUTE
// ========================

app.post("/api/content", async (req, res) => {

  try {

    const {
      question,
      history = [],
    } = req.body;

    if (!question) {

      return res.status(400).json({
        error: "Question required",
      });

    }

    const result = await generate(
      question,
      history
    );

    res.json({
      success: true,
      result,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error",
    });

  }

});


// ========================
// SERVER
// ========================

app.listen(5003, () => {

  console.log(
    "Server running on http://localhost:5003"
  );

});

// API_KEY=AIzaSyBT0o7lz_SPreT71sPVVZatErqzwHcLdt8
// PORT=5003
