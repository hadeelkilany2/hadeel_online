/**
 * تيليجرام: أسئلة الشات + طلبات السلة.
 * المسار النسبي يشتغل لما الموقع والـ function على نفس النطاق (Netlify/Vercel).
 *
 * التوكن و TELEGRAM_CHAT_ID ما بينحطوا هنا — من لوحة Netlify/Vercel:
 * Site settings → Environment variables → أضيفي:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID
 */
window.HADEEL_TELEGRAM_NOTIFY = {
    url: '/api/chat-to-telegram',
    secret: '',
};

/** طلبات السلة عبر واتساب: رقم المتجر بصيغة دولية بدون + */
window.HADEEL_WHATSAPP_ORDER = {
    phone: '972525988584',
};
