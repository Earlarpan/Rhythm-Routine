# Torien
AI productivity workspace powered by Torien
Plan Your Future Ahead

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
- Separate Agents page with OpenAI, Claude, and Gemini provider chat
- Provider API keys stay on the server and are never placed in browser code
- Fallback responses when no API key is configured

## Provider API setup

```bash
export OPENAI_API_KEY="your_key_here"
export ANTHROPIC_API_KEY="your_key_here"
export GEMINI_API_KEY="your_key_here"
npm start
```

Set only the keys for providers you plan to use. ChatGPT access uses the OpenAI API and is billed separately from a ChatGPT subscription. For Vercel, add the keys under **Project Settings → Environment Variables**, then redeploy. Keep this app private or add access controls before configuring keys; visitors can use configured provider keys and incur API charges.
