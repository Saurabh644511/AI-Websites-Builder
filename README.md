# AI Websites Builder 🚀

An AI-powered website builder that converts natural language prompts into complete React websites.

Users can describe the website they want, and the AI generates the project structure, files, code, and a live preview directly in the browser.

## 🌐 Live Demo

[AI Websites Builder](https://ai-websites-builder.vercel.app/)

## ✨ Features

- 🤖 AI-powered website generation
- 💬 Generate websites using natural language prompts
- 📁 Automatic file and folder generation
- 📝 Built-in code editor
- 🌐 Live website preview
- 🔄 Interactive follow-up prompts
- 📋 Step-by-step project generation
- ⚡ Browser-based development environment using WebContainer
- 🔐 Backend API for secure Gemini API communication

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- Google Gemini API
- CORS
- dotenv

### Browser Runtime

- WebContainer API

### Deployment

- Frontend: Vercel
- Backend: Render

## 🏗️ Architecture

```text
User Prompt
     │
     ▼
┌─────────────────────┐
│   React Frontend    │
│      Vercel         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Express Backend   │
│      Render         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Gemini API       │
│   AI Code Generation│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Generated Project   │
│ Files + Code        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    WebContainer     │
│    Live Preview     │
└─────────────────────┘
