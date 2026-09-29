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
- Optional live OpenAI integration via the OPENAI_API_KEY environment variable
- Fallback responses when no API key is configured

## Optional API setup

```bash
export OPENAI_API_KEY="your_key_here"
npm start
```
