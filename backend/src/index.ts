import dotenv from "dotenv";
dotenv.config();

import express from "express";

import { GoogleGenAI } from "@google/genai";

// console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({});
const app = express();

app.post("/template", (req, res) => {
    const prompt = req.body.prompt;
})

async function main() {
  const stream = await ai.interactions.create({
    model: "gemini-3.5-flash-lite",
    input: "Write the code for a Todo Application",
    stream: true,
  });

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        process.stdout.write(event.delta.text);
      }
    }
  }
}

main();
