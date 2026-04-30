const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Inisialisasi Supabase menggunakan Environment Variables di Vercel
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

module.exports = async (req, res) => {
    // Pengaturan Izin Akses (CORS) agar bisa dipanggil dari Acode
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Menangani Preflight Request dari Browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Sistem hanya menerima metode POST." });
    }

    const { message, userId } = req.body;

    try {
        // 1. Memanggil Otak AI (Claude 3 Haiku)
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
        
        // Cek jika API Key Claude bermasalah
        if (!data.content || !data.content[0]) {
            throw new Error(data.error ? data.error.message : "Gagal mendapatkan respon dari AI.");
        }

        const aiReply = data.content[0].text;

        // 2. Menyimpan Riwayat Chat ke Supabase (Database RAPX)
        await supabase.from('chat_logs').insert([
            { 
                user_id: userId || 'GUEST_USER', 
                message: message, 
                response: aiReply,
                created_at: new Date()
            }
        ]);

        // 3. Mengirim Jawaban ke Tampilan Acode
        return res.status(200).json({ reply: aiReply });

    } catch (err) {
        console.error("Internal Error:", err.message);
        return res.status(500).json({ 
            error: "Terjadi gangguan pada sistem saraf pusat AI.",
            details: err.message 
        });
    }
};

