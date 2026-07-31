/**
 * Vercel: نفس منطق Netlify — شات + طلبات، مع تقسيم الرسائل الطويلة.
 */

function applyCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Notify-Secret');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

var MAX_IN = 25000;
var CHUNK = 3800;

module.exports = async function (req, res) {
    applyCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false });
    }

    var envSecret = process.env.NOTIFY_SECRET;
    if (envSecret) {
        var sent = (req.headers['x-notify-secret'] || '').trim();
        if (sent !== envSecret) {
            return res.status(401).json({ ok: false });
        }
    }

    var body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body || '{}');
        } catch (e) {
            body = {};
        }
    }
    if (!body || typeof body !== 'object') {
        body = {};
    }

    var text = String(body.text || '').trim();
    if (!text) {
        return res.status(400).json({ ok: false });
    }
    if (text.length > MAX_IN) text = text.slice(0, MAX_IN);

    var token = process.env.TELEGRAM_BOT_TOKEN;
    var chatIds = String(process.env.TELEGRAM_CHAT_IDS || '')
        .split(',')
        .map(function (id) { return id.trim(); })
        .filter(Boolean);
    if (!token || !chatIds.length) {
        return res.status(500).json({ ok: false, error: 'missing_env' });
    }

    var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
    var parts = [];
    for (var i = 0; i < text.length; i += CHUNK) {
        parts.push(text.slice(i, i + CHUNK));
    }

    for (var p = 0; p < parts.length; p++) {
        var chunk = parts.length > 1 ? '(' + (p + 1) + '/' + parts.length + ')\n' + parts[p] : parts[p];
        for (var c = 0; c < chatIds.length; c++) {
            var r = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatIds[c], text: chunk }),
            });
            var data = await r.json().catch(function () {
                return {};
            });
            if (!r.ok || !data.ok) {
                return res.status(502).json({ ok: false });
            }
        }
    }

    return res.status(200).json({ ok: true });
};
