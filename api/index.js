const fetch = require('node-fetch');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, image } = req.body || {};
    const GEMINI_KEY = "AIzaSyCv66K59nGCyVviDmDCVpn57ZcDNIjCwqo"; // Key Kaka sudah saya tanam di sini

    try {
        let contents = [];
        if (image && image.includes(',')) {
            contents.push({
                parts: [
                    { text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Jawab: " + (message || "Analisis gambar ini") },
                    { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                ]
            });
        } else {
            contents.push({
                parts: [{ text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Jawab: " + (message || "Halo") }]
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            const reply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply });
        } else {
            return res.status(200).json({ reply: "Google AI sedang sibuk, coba lagi nanti." });
        }
    } catch (err) {
        return res.status(200).json({ reply: "Sistem Error: " + err.message });
    }
};
