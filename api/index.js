const fetch = require('node-fetch');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, image } = req.body || {};
    const KEY = "AIzaSyCv66K59nGCyVviDmDCVpn57ZcDNIjCwqo";

    try {
        let contents = [{
            parts: [{ text: "Nama kamu RAFAGPT buatan RAPX. Jawab: " + (message || "Halo") }]
        }];

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Server Ready!";
        
        return res.status(200).json({ reply });
    } catch (err) {
        return res.status(200).json({ reply: "Error: " + err.message });
    }
};

