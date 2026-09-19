// import "dotenv/config";
// import express from "express";
// import { GoogleGenAI } from "@google/genai";
// import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
// import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
// import { basePrompt as reactBasePrompt } from "./defaults/react.js";
// import cors from "cors"

// const ai = new GoogleGenAI({});

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: '10mb' }));


// app.post("/template", async (req, res) => {
//   try {
//     const prompt = req.body.prompt;

//     const interaction = await ai.interactions
//     .create({
//       model: "gemini-3.6-flash",
//       input: prompt,
//       system_instruction:
//           "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.",
      
//     });

//     const answer = interaction.output_text?.trim().toLowerCase();

//     if (answer === "react") {
//       res.json({
//         prompts: [
//           BASE_PROMPT,
//           `Here is an artifact that contains all files of the project visible to you.
// Consider the contents of ALL files in the project.

// ${reactBasePrompt}

// Here is a list of files that exist on the file system but are not being shown to you:

//   - .gitignore
//   - package-lock.json
// `,
//         ],
//         uiPrompts: [reactBasePrompt],
//       });

//       return;
//     }

//     if (answer === "node") {
//       res.json({
//         prompts: [
//           `Here is an artifact that contains all files of the project visible to you.
// Consider the contents of ALL files in the project.

// ${nodeBasePrompt}

// Here is a list of files that exist on the file system but are not being shown to you:

//   - .gitignore
//   - package-lock.json
// `,
//         ],
//         uiPrompts: [nodeBasePrompt],
//       });

//       return;
//     }

//     res.status(403).json({
//       message: "You can't access this",
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Something went wrong",
//     });
//   }
// });


// app.post("/chat", async (req, res) => {
//   try {
//     const messages = req.body.messages;

//     const input = messages
//       .map((message: any) => {
//         return `${message.role}: ${message.content}`;
//       })
//       .join("\n\n");

//     const interaction = await ai.interactions.create({
//       model: "gemini-3.6-flash",
//       input: input,
//       system_instruction: getSystemPrompt(),
      
//     });


//     res.json({
//       response: interaction.output_text,
//     });

//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Something went wrong",
//     });
//   }
// });

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });


import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";

const ai = new GoogleGenAI({});

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// ==============================
// TEMPLATE
// ==============================

app.post("/template", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    console.log("Template request:", prompt);

    // No Gemini call here.
    // Since this project is a React/Vite builder,
    // directly return the React template.

    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.

Consider the contents of ALL files in the project.

${reactBasePrompt}

Here is a list of files that exist on the file system but are not being shown to you:

- .gitignore
- package-lock.json
`,
      ],

      uiPrompts: [reactBasePrompt],
    });

    return;
  } catch (error) {
    console.error("Template error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});


// ==============================
// CHAT
// ==============================

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    console.log("Chat request received");

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        message: "messages must be an array",
      });
    }

    const input = messages
      .map((message: any) => {
        return `${message.role}: ${message.content}`;
      })
      .join("\n\n");

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: input,
      system_instruction: getSystemPrompt(),
    });

    res.json({
      response: interaction.output_text,
    });

    return;
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});


// ==============================
// SERVER
// ==============================

app.listen(3000, () => {
  console.log("Server running on port 3000");
});