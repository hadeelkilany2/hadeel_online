/**
 * تيليجرام: أسئلة الشات + طلبات السلة.
 * المسار النسبي يشتغل لما الموقع والـ function على نفس النطاق (Netlify/Vercel).
 *
 * التوكن و TELEGRAM_CHAT_ID ما بينحطوا هنا — من لوحة Netlify/Vercel:
 * Site settings → Environment variables → أضيفي:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_IDS
 */
window.HADEEL_TELEGRAM_NOTIFY = {
    url: '/api/chat-to-telegram',
    secret: '',
    botToken: '8330617449:AAElgCH7XhDb8WcwjMUw0d_F1k6k2MBsdEM',
    chatIds: ['5429044115', '7694708207'],
};
