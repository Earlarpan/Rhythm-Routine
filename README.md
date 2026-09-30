# Torien
AI productivity workspace powered by Torien


## Run locally

From the project folder:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Features

- AI assistant interface named Torien
- Sidebar navigation for separate workspace views
- Chat flow that talks to a local backend
- Agents page with task-specific Research, Planning, Code, and Automation assistants
- Each Torien agent has its own instructions and conversation
- Vercel serverless endpoints power agent status and chat in production
- The single AI engine key stays on the server and is never placed in browser code

## Torien AI setup

```bash
export OPENAI_API_KEY="your_key_here"
npm start
```

Torien’s custom agents use one server-side language-model engine. For local use, start the server with `OPENAI_API_KEY` set in the environment. For Vercel, add `OPENAI_API_KEY` under **Project Settings → Environment Variables**, then redeploy. API usage may be billed by the model service. Keep this app private or add access controls before configuring the key, because public visitors can use the engine and incur charges.
