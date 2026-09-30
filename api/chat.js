export default async function handler(req, res) {
  // Clear any potential formatting crashes by setting standard JSON headers immediately
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Configuration Error: GITHUB_TOKEN is missing on Vercel." });
    }

    // Direct, ultra-stable server-to-server call to the GitHub AI endpoints
    const response = await fetch('https://github.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Torien, a brilliant and helpful AI agent dashboard." },
          { role: "user", content: message || "Hello" }
        ],
        model: "openai/gpt-4o-mini",
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "GitHub API credentials rejected." });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: "System pipeline crashed: " + error.message });
  }
}
