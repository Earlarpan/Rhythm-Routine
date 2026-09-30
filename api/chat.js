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
          { role: "user", content: message }
        ],
        model: "openai/gpt-4o-mini",
        temperature: 0.7
      })
    });

    // If the response is broken, extract the text immediately to tell us why
    const responseText = await apiResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: `Server sent unreadable response: ${responseText.slice(0, 100)}` });
    }

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: `GitHub Status (${apiResponse.status}): ${data.message || 'Token permission issue'}` 
      });
    }

    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: "Empty answer packet received." });
    }

  } catch (error) {
    return res.status(500).json({ error: "Connection route blocked: " + error.message });
  }
}

