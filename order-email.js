/**
 * إرسال نص الطلب إلى بريد هديل (تلقائي عند إتمام السلة).
 * يعتمد FormSubmit — أول مرة قد ترسل خدمة رسالة تفعيل إلى نفس البريد؛ افتحي الرابط فيها مرة واحدة.
 */
(function () {
    var INBOX = 'kilanyhadeel2@gmail.com';
    var ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(INBOX);

    /**
     * @param {{ subject: string, message: string, customerName?: string, customerPhone?: string }} opts
     * @returns {Promise<Response>}
     */
    function hadeelSendOrderToInbox(opts) {
        opts = opts || {};
        var subject = String(opts.subject || 'طلب جديد - Hadeel SkinCare').slice(0, 500);
        var message = String(opts.message || '');
        if (!message.trim()) return Promise.resolve(new Response(null, { status: 204 }));

        return fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                _subject: subject,
                _captcha: false,
                name: String(opts.customerName || '').slice(0, 200),
                phone: String(opts.customerPhone || '').slice(0, 80),
                message: message.slice(0, 120000),
            }),
        });
    }

    window.hadeelSendOrderToInbox = hadeelSendOrderToInbox;
})();
