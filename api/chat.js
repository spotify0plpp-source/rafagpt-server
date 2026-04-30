const fetch = require('node-fetch');
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message, image } = req.body;
    try {
        let contents = [{ parts: [{ text: "Nama kamu RAFAGPT buatan RAPX. Jawab: " + message }] }];
        if (image) {
            contents[0].parts.push({ inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const hasilAI = data.candidates[0].content.parts[0].text;

        // KITA PAKAI NAMA 'reply' BIAR ACODE GAK BINGUNG
        return res.status(200).json({ reply: hasilAI }); 
    } catch (err) {
        return res.status(500).json({ reply: "Sistem Error: " + err.message });
    }
};
