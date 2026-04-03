/**
 * فتح واتساب مع نص الطلب جاهز (الزبون يضغط «إرسال»).
 * الرقم في telegram-config.js → HADEEL_WHATSAPP_ORDER.phone (دولي بدون +، مثال: 972591234567)
 */
(function () {
    function digits(raw) {
        return String(raw || '').replace(/\D/g, '');
    }

    /**
     * @param {string} text
     * @returns {boolean} true إذا فُتح الرابط
     */
    function hadeelOpenOrderWhatsApp(text) {
        var cfg = typeof window !== 'undefined' ? window.HADEEL_WHATSAPP_ORDER : null;
        var d = cfg && digits(cfg.phone);
        if (!d) return false;
        var t = String(text || '').trim();
        if (!t) return false;
        if (t.length > 3800) {
            t = t.slice(0, 3797) + '...';
        }
        var url = 'https://wa.me/' + d + '?text=' + encodeURIComponent(t);
        var w = window.open(url, '_blank', 'noopener,noreferrer');
        return !!w;
    }

    window.hadeelOpenOrderWhatsApp = hadeelOpenOrderWhatsApp;
})();
