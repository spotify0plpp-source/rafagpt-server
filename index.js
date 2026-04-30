const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Header Wajib biar Acode bisa akses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, image } = req.body || {};
    // API KEY KAKA (Sudah saya tanam)
    const KEY = "AIzaSyCv66K59nGCyVviDmDCVpn57ZcDNIjCwqo";

    try {
        let contents = [];
        if (image && image.includes(',')) {
            contents.push({
                parts: [
                    { text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Jawab dengan cerdas: " + (message || "Analisis gambar ini") },
                    { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                ]
            });
        } else {
            contents.push({
                parts: [{ text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Jawab dengan cerdas: " + (message || "Halo") }]
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI sedang overload.";
        
        return res.status(200).json({ reply });

    } catch (err) {
        return res.status(200).json({ reply: "Sistem Error: " + err.message });
    }
};
