export default async function handler(req, res) {
  // Clear any weird routing configurations by setting standard JSON headers immediately
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Configuration Error: GITHUB_TOKEN variable is missing on Vercel settings profile." });
    }

    // Direct, ultra-stable connection structure designed perfectly for Vercel servers
    const apiResponse = await fetch('https://github.ai', {
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

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: data.message || "GitHub API credentials rejected." });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: "System pipeline crashed: " + error.message });
  }
}
