const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, userId, image } = req.body;

    try {
        let contents = [];
        
        // Jika ada gambar (Base64)
        if (image) {
            contents.push({
                parts: [
                    { text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Analisis gambar ini dan jawab pertanyaan user: " + message },
                    { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                ]
            });
        } else {
            contents.push({
                parts: [{ text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Jawab dengan cerdas: " + message }]
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const aiReply = data.candidates[0].content.parts[0].text;

        await supabase.from('chat_logs').insert([{ user_id: userId || 'GUEST', message: message, response: aiReply }]);

        return res.status(200).json({ reply: aiReply });
    } catch (err) {
        return res.status(500).json({ error: "System Error", details: err.message });
    }
};
