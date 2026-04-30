const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Inisialisasi Supabase pake Variabel yang lu isi di Vercel tadi
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

module.exports = async (req, res) => {
  // Biar gak error CORS pas dipanggil dari Acode/HP
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message, userId } = req.body;

  try {
    // 1. Hubungi Claude
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

    // 2. Simpan ke Database Supabase
    await supabase.from('chat_logs').insert([
      { user_id: userId || 'RAFA_USER', message: message, response: aiReply }
    ]);

    // 3. Kirim balik ke HP lu
    return res.status(200).json({ reply: aiReply });

  } catch (err) {
    return res.status(500).json({ error: "Waduh Boss, ada yang putus: " + err.message });
  }
};
