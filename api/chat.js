const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Setup Database Supabase
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

module.exports = async (req, res) => {
    // Izin Akses (CORS) agar bisa dipanggil dari Acode
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, userId } = req.body;

    try {
        // PANGGIL MESIN GEMINI 1.5 (PINTER & GRATIS)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: "Nama kamu adalah RAFAGPT, asisten AI pinter buatan Rafa Fauzan Kamil (RAPX). Jawablah setiap pertanyaan dengan formal, sopan, dan cerdas. Pertanyaan user: " + message }] 
                }]
            })
        });

        const data = await response.json();
        
        // Cek jika ada error dari Google
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiReply = data.candidates[0].content.parts[0].text;

        // Simpan log chat ke Supabase RAPX
        await supabase.from('chat_logs').insert([
            { user_id: userId || 'GUEST', message: message, response: aiReply }
        ]);

        return res.status(200).json({ reply: aiReply });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            error: "Sistem AI Sedang Maintenance",
            details: err.message 
        });
    }
};
