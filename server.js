const express = require('express');
const path = require('path');
const { getAgentStatus, requestAgent } = require('./lib/torien');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/agents', (req, res) => {
  res.json(getAgentStatus());
});

app.post('/api/agent', async (req, res) => {
  try {
    const result = await requestAgent(req.body || {});
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 502).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Torien is running on http://localhost:${port}`);
});
