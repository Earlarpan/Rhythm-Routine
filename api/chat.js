export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const response = await fetch('https://github.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
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

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "GitHub API Error" });
    }

    const aiReply = data.choices.message.content;
    return res.status(200).json({ reply: aiReply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
