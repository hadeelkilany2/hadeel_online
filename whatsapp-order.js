/**
 * فتح واتساب مع نص الطلب جاهز (الزبون يضغط «إرسال»).
 * الرقم في telegram-config.js → HADEEL_WHATSAPP_ORDER.phone (دولي بدون +، مثال: 972591234567)
 *
 * يجرب عدة طرق لأن window.open قد يُحجب على الجوال، فيُظهر المستخدم كأن «ما انفتح واتساب».
 */
(function () {
    function digits(raw) {
        return String(raw || '').replace(/\D/g, '');
    }

    /**
     * فتح رابط في تبويب/نافذة جديدة بدون الاعتماد فقط على window.open.
     */
    function openUrlInNewContext(url) {
        var newWin = null;
        try {
            newWin = window.open(url, '_blank');
        } catch (e) {}

        if (newWin && typeof newWin.closed !== 'undefined' && !newWin.closed) {
            try {
                newWin.opener = null;
            } catch (e2) {}
            return true;
        }

        try {
            var a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
            a.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return true;
        } catch (e3) {}

        return false;
    }

    /**
     * @param {string} text
     * @returns {boolean} true إذا كان هناك رقم ونص صالح وحصل محاولة فتح
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

        if (openUrlInNewContext(url)) {
            return true;
        }

        window.location.href = url;
        return true;
    }

    window.hadeelOpenOrderWhatsApp = hadeelOpenOrderWhatsApp;
})();
