// Force Vercel to use the high-performance global Edge Runtime (bypasses network blocks!)
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { message } = await req.json();
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ error: "Configuration Error: GITHUB_TOKEN is missing on Vercel." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Direct, unblocked edge stream request format
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

    const responseText = await apiResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return new Response(JSON.stringify({ error: `Server sent unreadable response: ${responseText.slice(0, 100)}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (!apiResponse.ok) {
      return new Response(JSON.stringify({ error: `GitHub Status (${apiResponse.status}): ${data.message || 'Token permission issue'}` }), { status: apiResponse.status, headers: { 'Content-Type': 'application/json' } });
    }

    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return new Response(JSON.stringify({ reply: data.choices[0].message.content }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: "Empty answer packet received." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: "Edge route interrupted: " + error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

