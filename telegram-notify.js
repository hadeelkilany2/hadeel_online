/**
 * إرسال نص إلى تيليجرام عبر نفس رابط الـ API (شات + طلبات).
 * التوكن يُضاف فقط في Netlify/Vercel وليس هنا.
 */
(function () {
    var MAX_CLIENT = 20000;

    function hadeelPostTelegram(text) {
        var cfg = typeof window !== 'undefined' ? window.HADEEL_TELEGRAM_NOTIFY : null;
        if (!cfg || !cfg.url) return;
        var body = String(text || '').trim();
        if (!body) return;
        if (body.length > MAX_CLIENT) body = body.slice(0, MAX_CLIENT);
        var headers = { 'Content-Type': 'application/json' };
        if (cfg.secret) headers['X-Notify-Secret'] = cfg.secret;
        fetch(cfg.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text: body }),
        }).catch(function () {});
    }

    window.hadeelPostTelegram = hadeelPostTelegram;
})();
