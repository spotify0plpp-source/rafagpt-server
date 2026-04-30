const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Header Wajib agar Acode tidak kena blokir
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { message, image } = req.body || {};

        // Cek apakah Key sudah terpasang
        if (!process.env.GEMINI_KEY) {
            return res.status(200).json({ reply: "Error: Variabel GEMINI_KEY belum dipasang di Vercel!" });
        }

        let contents = [];
        if (image && image.includes(',')) {
            contents.push({
                parts: [
                    { text: "Nama kamu RAFAGPT buatan RAPX. " + (message || "Analisis gambar ini") },
                    { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                ]
            });
        } else {
            contents.push({
                parts: [{ text: "Nama kamu RAFAGPT buatan RAPX. " + (message || "Halo") }]
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        // Cek apakah Google ngasih jawaban atau error
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        } else {
            return res.status(200).json({ reply: "Maaf, AI sedang overload atau API Key bermasalah." });
        }

    } catch (err) {
        // Jika kodingan error, kirim pesan ini ke Acode, bukan 505
        return res.status(200).json({ reply: "Sistem Error: " + err.message });
    }
};
