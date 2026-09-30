export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Configuration Error: GITHUB_TOKEN is missing on Vercel." });
    }

    // Direct, ultra-compatible payload connection format for Vercel environments
    const apiResponse = await fetch('https://github.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Torien, a brilliant and helpful AI agent dashboard." },
          { role: "user", content: message }
        ],
        model: "openai/gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: `GitHub Server Rejected Request (${apiResponse.status}): ${data.message || 'Invalid Token Permissions'}` 
      });
    }

    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: "Received an empty response structure from the AI cluster." });
    }

  } catch (error) {
    return res.status(500).json({ error: "Network stream interrupted: " + error.message });
  }
}
