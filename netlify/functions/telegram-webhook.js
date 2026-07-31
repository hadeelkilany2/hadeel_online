/*
 * Telegram webhook for the Hadeel store bot.
 *
 * Required env:
 *   TELEGRAM_BOT_TOKEN
 *
 * Optional env:
 *   TELEGRAM_WEBHOOK_SECRET - same value passed as secret_token to setWebhook
 */

var jsonHeaders = { 'Content-Type': 'application/json' };

function normalize(text) {
    return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/[إأآا]/g, 'ا')
        .replace(/[ى]/g, 'ي')
        .replace(/[ة]/g, 'ه');
}

function includesAny(text, words) {
    for (var i = 0; i < words.length; i++) {
        if (text.indexOf(words[i]) !== -1) return true;
    }
    return false;
}

function buildProductsUrl() {
    var siteUrl = String(process.env.SITE_URL || process.env.URL || '').replace(/\/+$/, '');
    return siteUrl ? siteUrl + '/products.html' : 'products.html';
}

function buildReply(rawText, firstName) {
    var text = normalize(rawText);
    var name = firstName ? ' ' + firstName : '';

    if (!text || text === '/start' || text === 'start' || text === '/help' || text === 'help') {
        return (
            'اهلا' + name + ' في بوت هديل للعناية والجمال.\n\n' +
            'اكتبي:\n' +
            '- منتجات: لعرض رابط المنتجات\n' +
            '- طلب: لمعرفة طريقة الطلب\n' +
            '- شحن: لمعلومات التوصيل\n' +
            '- دفع: لطرق الدفع\n\n' +
            'واذا عندك سؤال خاص اكتبيه هون.'
        );
    }

    if (includesAny(text, ['منتج', 'منتجات', 'اسعار', 'سعر'])) {
        return 'تقدري تشوفي المنتجات والاسعار من صفحة المنتجات:\n' + buildProductsUrl();
    }

    if (includesAny(text, ['طلب', 'اطلب', 'اشتري', 'شراء', 'سله', 'سلة'])) {
        return 'طريقة الطلب سهلة: اختاري المنتجات من الموقع، اضيفيها للسلة، عبّي بيانات التوصيل، وبعدها اختاري الدفع نقدي او Bit.';
    }

    if (includesAny(text, ['شحن', 'توصيل', 'منطقه', 'منطقة', 'عنوان'])) {
        return 'التوصيل حسب المنطقة المختارة داخل السلة. اذا بدك مساعدة، ارسلي اسم المنطقة والطلب المطلوب.';
    }

    if (includesAny(text, ['دفع', 'bit', 'بت', 'نقد', 'كاش'])) {
        return 'طرق الدفع المتاحة: نقدي عند الاستلام او Bit حسب ما يظهر لك في صفحة السلة.';
    }

    if (includesAny(text, ['تلجرام', 'telegram', 'طلب'])) {
        return 'للطلب، افتحي السلة وكملي البيانات. سيصل الطلب مباشرة على تلجرام.';
    }

    return 'وصلت رسالتك. اكتبي "منتجات"، "طلب"، "شحن"، او "دفع" للمساعدة السريعة، او ارسلي سؤالك بالتفصيل.';
}

async function sendTelegramMessage(token, chatId, text) {
    var res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            disable_web_page_preview: true,
        }),
    });

    return res.ok;
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
    }

    var secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
        var sent = event.headers['x-telegram-bot-api-secret-token'] || event.headers['X-Telegram-Bot-Api-Secret-Token'] || '';
        if (sent !== secret) {
            return { statusCode: 401, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
        }
    }

    var token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ ok: false, error: 'missing_token' }) };
    }

    var update;
    try {
        update = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
    }

    var message = update.message || update.edited_message;
    if (!message || !message.chat || !message.chat.id) {
        return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ ok: true, ignored: true }) };
    }

    var text = message.text || '';
    var firstName = message.from && message.from.first_name ? message.from.first_name : '';
    var reply = buildReply(text, firstName);

    await sendTelegramMessage(token, message.chat.id, reply);

    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ ok: true }) };
};
