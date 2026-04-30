const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Setting Header agar Acode bisa akses (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request dari browser/Acode
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, image } = req.body || {};
    
    // API KEY KAKA RAFA
    const KEY = "AIzaSyCv66K59nGCyVviDmDCVpn57ZcDNIjCwqo";

    try {
        let contents = [];
        if (image && image.includes(',')) {
            // Mode Gambar
            contents.push({
                parts: [
                    { text: "Nama kamu RAFAGPT buatan Rafa Fauzan Kamil (RAPX). Jawab dengan cerdas: " + (message || "Analisis gambar ini") },
                    { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                ]
            });
        } else {
            // Mode Teks Biasa
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
        
        // Ambil balasan AI
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Server Ready! Silahkan kirim pesan dari Acode.";
        
        return res.status(200).json({ reply });

    } catch (err) {
        return res.status(200).json({ reply: "Sistem Error: " + err.message });
    }
};

