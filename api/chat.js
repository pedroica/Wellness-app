export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'CLAUDE_API_KEY nao configurada no servidor. Configure em Vercel > Settings > Environment Variables.' });
    return;
  }

  try {
    const { messages, max_tokens } = req.body || {};

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 500,
        messages: messages || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = (data && data.error && data.error.message) || 'Erro na API da Claude';
      res.status(response.status).json({ error: message });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
