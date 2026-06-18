/**
 * Opens WhatsApp with the order text ready for the customer to send.
 * WhatsApp does not allow websites to send messages silently; the customer
 * still needs to tap "Send" inside WhatsApp.
 */
(function () {
    function digits(raw) {
        return String(raw || '').replace(/\D/g, '');
    }

    function buildOrderWhatsAppUrl(text) {
        var cfg = typeof window !== 'undefined' ? window.HADEEL_WHATSAPP_ORDER : null;
        var d = cfg && digits(cfg.phone);
        if (!d) return '';

        var t = String(text || '').trim();
        if (!t) return '';
        if (t.length > 3800) t = t.slice(0, 3797) + '...';

        return 'https://wa.me/' + d + '?text=' + encodeURIComponent(t);
    }

    function hadeelOpenOrderWhatsApp(text) {
        var url = buildOrderWhatsAppUrl(text);
        if (!url) return false;

        try {
            window.location.assign(url);
        } catch (e) {
            window.location.href = url;
        }

        return true;
    }

    window.hadeelBuildOrderWhatsAppUrl = buildOrderWhatsAppUrl;
    window.hadeelOpenOrderWhatsApp = hadeelOpenOrderWhatsApp;
})();
