(function () {
    var PRESETS = [
        { id: 'prep', label: 'مدة التحضير', answer: 'تجهيز الطلب عادةً يستغرق من 1 إلى 3 أيام عمل بعد التأكيد. في أوقات الذروة قد نعلن عن مدة أطول على إنستغرام.' },
        { id: 'delivery', label: 'التوصيل', answer: 'التوصيل للمناطق المتاحة في السلة (جنوب، شمال، وادي عاره، باقة أو جت…). المدة التقريبية بعد الإرسال حوالي 2–5 أيام عمل. تأكدي من صحة العنوان والهاتف.' },
        { id: 'pay', label: 'طرق الدفع', answer: 'من السلة: إما دفع نقدي عند استلام الطلب، أو الدفع عبر تطبيق بت بمسح رمز QR.' },
        { id: 'return', label: 'الاسترجاع', answer: 'منتجات العناية الشخصية لا تُسترجع بعد الفتح أو الاستخدام لأسباب صحية. إذا وصل طلب تالف، راسلينا خلال 48 ساعة مع صورة عبر إنستغرام @hadeel.k_beauty.' },
        { id: 'order', label: 'كيف أطلب؟', answer: 'اختاري المنتجات من صفحة المنتجات، أضيفيها للسلة، عبّي بيانات التوصيل واختاري نقدي أو بت، ثم أكملي الطلب. ستُوجَّهين لصفحة تأكيد.' },
        { id: 'insta', label: 'إنستغرام', answer: 'تابعينا على @hadeel.k_beauty للعروض والتواصل عبر الخاص.' }
    ];

    var KEYWORD_ROWS = [
        { keys: ['توصيل', 'شحن', 'شحنة', 'وصول', 'delivery'], answer: PRESETS[1].answer },
        { keys: ['استرجاع', 'إرجاع', 'استبدال', 'ترجيع'], answer: PRESETS[3].answer },
        { keys: ['تحضير', 'تجهيز', 'متى', 'مدة', 'يوم'], answer: PRESETS[0].answer },
        { keys: ['دفع', 'بت', 'bit', 'COD', 'عند الاستلام', 'مال'], answer: PRESETS[2].answer },
        { keys: ['طلب', 'سلة', 'شراء'], answer: PRESETS[4].answer },
        { keys: ['انستغرام', 'إنستغرام', 'instagram'], answer: PRESETS[5].answer }
    ];

    var INSTA_URL = 'https://instagram.com/hadeel.k_beauty';

    function forwardUserQuestionToTelegram(text) {
        var q = String(text || '').trim();
        if (!q) return;
        if (typeof window.hadeelPostTelegram === 'function') {
            window.hadeelPostTelegram('📩 سؤال من الشات:\n\n' + q);
        }
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function matchAnswer(text) {
        var t = (text || '').trim();
        if (!t) return null;
        var lower = t.toLowerCase();
        for (var i = 0; i < KEYWORD_ROWS.length; i++) {
            var row = KEYWORD_ROWS[i];
            for (var j = 0; j < row.keys.length; j++) {
                var k = row.keys[j];
                if (t.indexOf(k) !== -1 || lower.indexOf(k.toLowerCase()) !== -1) return row.answer;
            }
        }
        return 'لم أتعرّف على السؤال بدقة. اختاري أحد الأزرار أدناه، أو راسلينا على إنستغرام @hadeel.k_beauty.';
    }

    function answerForQuestion(q) {
        var t = String(q || '').trim();
        if (!t) return '';
        for (var i = 0; i < PRESETS.length; i++) {
            if (PRESETS[i].label === t) return PRESETS[i].answer;
        }
        return matchAnswer(t);
    }

    function appendMessage(container, role, html) {
        var div = document.createElement('div');
        div.className = 'chatbot-msg chatbot-msg--' + role;
        div.innerHTML = html;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * يبني واجهة المحادثة داخل container (نافذة عائمة أو صفحة chat).
     * options.withCloseButton — زر إغلاق في الهيدر
     * options.showFooterLink — رابط إنستغرام أسفل الصندوق
     */
    function mount(container, options) {
        if (!container) return;
        options = options || {};
        var withClose = !!options.withCloseButton;
        var showFooter = !!options.showFooterLink;
        var titleHtml = '<span class="chatbot-panel-title"><i class="fas fa-robot" aria-hidden="true"></i> Hadeel AI</span>';
        var closeHtml = withClose
            ? '<button type="button" class="chatbot-panel-close chatbot-js-close" aria-label="إغلاق"><i class="fas fa-times" aria-hidden="true"></i></button>'
            : '';
        var headClass = withClose ? 'chatbot-panel-head' : 'chatbot-panel-head chatbot-panel-head--embed';
        var footerHtml = showFooter
            ? '<a href="' + escapeHtml(INSTA_URL) + '" class="chatbot-footer-link" target="_blank" rel="noopener noreferrer">' +
              'تواصلي على إنستغرام <i class="fab fa-instagram" aria-hidden="true"></i></a>'
            : '';

        container.innerHTML =
            '<div class="chatbot-embed-panel">' +
            '<div class="' + headClass + '">' +
            titleHtml +
            closeHtml +
            '</div>' +
            '<div class="chatbot-messages chatbot-js-messages" aria-live="polite"></div>' +
            '<div class="chatbot-quick chatbot-js-quick"></div>' +
            '<form class="chatbot-form chatbot-js-form">' +
            '<input type="text" class="chatbot-input chatbot-js-input" placeholder="اكتبي سؤالك…" autocomplete="off" maxlength="200" />' +
            '<button type="submit" class="chatbot-send" aria-label="إرسال"><i class="fas fa-paper-plane" aria-hidden="true"></i></button>' +
            '</form>' +
            footerHtml +
            '</div>';

        var messages = container.querySelector('.chatbot-js-messages');
        var quick = container.querySelector('.chatbot-js-quick');
        var form = container.querySelector('.chatbot-js-form');
        var input = container.querySelector('.chatbot-js-input');

        function sendUserMessage(q) {
            q = String(q || '').trim();
            if (!q) return;
            appendMessage(messages, 'user', escapeHtml(q));
            appendMessage(messages, 'bot', escapeHtml(answerForQuestion(q)));
            forwardUserQuestionToTelegram(q);
            input.value = '';
        }

        PRESETS.forEach(function (p) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'chatbot-chip';
            b.textContent = p.label;
            b.addEventListener('click', function () {
                input.value = p.label;
                if (input.focus) input.focus();
                try {
                    input.setSelectionRange(p.label.length, p.label.length);
                } catch (e) { /* بعض أنواع الحقول لا تدعم */ }
            });
            quick.appendChild(b);
        });

        appendMessage(messages, 'bot', escapeHtml('مرحباً! أنا Hadeel AI — اختاري موضوعاً سريعاً أو اكتبي سؤالك.'));

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            sendUserMessage(input.value);
        });

        return {
            onClose: function (fn) {
                var c = container.querySelector('.chatbot-js-close');
                if (c && typeof fn === 'function') c.addEventListener('click', fn);
            }
        };
    }

    function initFloatingWidget() {
        if (document.getElementById('hadeelChatbotRoot')) return;

        var root = document.createElement('div');
        root.className = 'chatbot-widget';
        root.id = 'hadeelChatbotRoot';

        var backdrop = document.createElement('div');
        backdrop.className = 'chatbot-backdrop chatbot-js-backdrop';
        backdrop.hidden = true;
        backdrop.setAttribute('aria-hidden', 'true');

        var panel = document.createElement('div');
        panel.className = 'chatbot-panel chatbot-panel--popup';
        panel.id = 'hadeelChatbotPanel';
        panel.hidden = true;
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', 'Hadeel AI');
        panel.setAttribute('aria-hidden', 'true');

        var inner = document.createElement('div');
        inner.className = 'chatbot-panel-mount';
        panel.appendChild(inner);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chatbot-widget-launcher';
        btn.id = 'hadeelChatbotToggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'hadeelChatbotPanel');
        btn.setAttribute('aria-label', 'فتح Hadeel AI');
        btn.innerHTML =
            '<span class="chatbot-widget-launcher-brand" aria-hidden="true">Hadeel</span>' +
            '<span class="chatbot-widget-launcher-ai">AI</span>';

        root.appendChild(btn);
        root.appendChild(backdrop);
        root.appendChild(panel);
        document.body.appendChild(root);

        var chatUiMounted = false;

        function ensureChatUi() {
            if (chatUiMounted) return;
            var api = mount(inner, { withCloseButton: true, showFooterLink: true });
            if (api && api.onClose) api.onClose(closePanel);
            chatUiMounted = true;
        }

        function openPanel() {
            ensureChatUi();
            panel.hidden = false;
            backdrop.hidden = false;
            panel.setAttribute('aria-hidden', 'false');
            backdrop.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            document.body.classList.add('chatbot-open');
            var inp = inner.querySelector('.chatbot-js-input');
            if (inp) setTimeout(function () { inp.focus(); }, 120);
        }

        function closePanel() {
            panel.hidden = true;
            backdrop.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
            backdrop.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('chatbot-open');
        }

        function togglePanel() {
            if (panel.hidden) openPanel();
            else closePanel();
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePanel();
        });
        backdrop.addEventListener('click', closePanel);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hidden) closePanel();
        });
    }

    function boot() {
        if (document.body.classList.contains('page-chat') && document.getElementById('chatbot-page-root')) {
            mount(document.getElementById('chatbot-page-root'), { withCloseButton: false, showFooterLink: true });
            return;
        }
        initFloatingWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.HadeelChatbot = { mount: mount, initFloatingWidget: initFloatingWidget };
})();
