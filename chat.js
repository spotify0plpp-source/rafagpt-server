const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { message, userId } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    const aiReply = data.content[0].text;

    await supabase.from('chat_logs').insert([{ user_id: userId, message, response: aiReply }]);

    res.status(200).json({ reply: aiReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
