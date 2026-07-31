/**
 * إرسال من الموقع إلى تيليجرام: أسئلة الشات + تفاصيل الطلبات.
 *
 * Netlify → Environment variables:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_IDS
 *   NOTIFY_SECRET (اختياري) — نفسه في telegram-config.js
 */

var cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Notify-Secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

var MAX_IN = 25000;
var CHUNK = 3800;

exports.handler = async function (event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: cors, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false }) };
    }

    var envSecret = process.env.NOTIFY_SECRET;
    if (envSecret) {
        var sent = (event.headers['x-notify-secret'] || event.headers['X-Notify-Secret'] || '').trim();
        if (sent !== envSecret) {
            return { statusCode: 401, headers: cors, body: JSON.stringify({ ok: false }) };
        }
    }

    var body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false }) };
    }

    var text = String(body.text || '').trim();
    if (!text) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false }) };
    }
    if (text.length > MAX_IN) text = text.slice(0, MAX_IN);

    var token = process.env.TELEGRAM_BOT_TOKEN;
    var chatIds = String(process.env.TELEGRAM_CHAT_IDS || '')
        .split(',')
        .map(function (id) { return id.trim(); })
        .filter(Boolean);
    if (!token || !chatIds.length) {
        return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: 'missing_env' }) };
    }

    var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
    var parts = [];
    for (var i = 0; i < text.length; i += CHUNK) {
        parts.push(text.slice(i, i + CHUNK));
    }

    for (var p = 0; p < parts.length; p++) {
        var chunk = parts.length > 1 ? '(' + (p + 1) + '/' + parts.length + ')\n' + parts[p] : parts[p];
        for (var c = 0; c < chatIds.length; c++) {
            var res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatIds[c], text: chunk }),
            });
            var data = await res.json().catch(function () {
                return {};
            });
            if (!res.ok || !data.ok) {
                return { statusCode: 502, headers: cors, body: JSON.stringify({ ok: false }) };
            }
        }
    }

    return {
        statusCode: 200,
        headers: Object.assign({ 'Content-Type': 'application/json' }, cors),
        body: JSON.stringify({ ok: true }),
    };
};
