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
        if (image && image.includes(',')) {
            contents.push({
                parts: [
                    { text: "Nama kamu RAFAGPT buatan RAPX. Jawab dengan cerdas: " + (message || "Analisis gambar ini") },
                    { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                ]
            });
        } else {
            contents.push({
                parts: [{ text: "Nama kamu RAFAGPT buatan RAPX. Jawab dengan cerdas: " + message }]
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        // VALIDASI DATA (Mencegah Error reading '0')
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            let errorMsg = "AI tidak bisa menjawab. ";
            if (data.promptFeedback) errorMsg += "Konten diblokir oleh sistem keamanan Google.";
            else if (data.error) errorMsg += data.error.message;
            else errorMsg += "Coba ulangi beberapa saat lagi.";
            
            return res.status(200).json({ reply: errorMsg });
        }

        const aiResponseText = data.candidates[0].content.parts[0].text;

        // Simpan log ke Supabase
        try {
            await supabase.from('chat_logs').insert([{ 
                user_id: userId || 'GUEST', 
                message: message || "(Kirim Gambar)", 
                response: aiResponseText 
            }]);
        } catch (dbErr) { console.error("DB Error ignored"); }

        return res.status(200).json({ reply: aiResponseText });

    } catch (err) {
        return res.status(200).json({ reply: "Sistem Error: " + err.message });
    }
};
