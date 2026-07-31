/**
 * إرسال نص إلى تيليجرام عبر نفس رابط الـ API (شات + طلبات).
 * التوكن يُضاف فقط في Netlify/Vercel وليس هنا.
 */
(function () {
    var MAX_CLIENT = 20000;

    function hadeelPostTelegram(text) {
        var cfg = typeof window !== 'undefined' ? window.HADEEL_TELEGRAM_NOTIFY : null;
        if (!cfg) return Promise.reject(new Error('Telegram config is missing'));
        var body = String(text || '').trim();
        if (!body) return Promise.reject(new Error('Telegram message is empty'));
        if (body.length > MAX_CLIENT) body = body.slice(0, MAX_CLIENT);

        if (cfg.botToken && Array.isArray(cfg.chatIds) && cfg.chatIds.length) {
            var telegramUrl = 'https://api.telegram.org/bot' + cfg.botToken + '/sendMessage';
            return Promise.all(cfg.chatIds.map(function(chatId) {
                return fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: body
                    }),
                }).then(function(response) {
                    if (!response.ok) throw new Error('Telegram direct request failed');
                    return response.json();
                });
            }));
        }

        if (!cfg.url) return Promise.reject(new Error('Telegram endpoint is not configured'));
        var headers = { 'Content-Type': 'application/json' };
        if (cfg.secret) headers['X-Notify-Secret'] = cfg.secret;
        return fetch(cfg.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text: body }),
        }).then(function(response) {
            if (!response.ok) throw new Error('Telegram request failed');
            return response.json();
        });
    }

    window.hadeelPostTelegram = hadeelPostTelegram;
})();
