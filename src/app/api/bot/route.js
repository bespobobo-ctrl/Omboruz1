import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(request) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ ok: true });
        }

        const chatId = message.chat.id;
        const text = message.text;

        if (text === '/start') {
            const welcomeText = `🏭 *OmborUZ — Ombor Boshqaruv Tizimi*\n\n` +
                `Xush kelibsiz! Bu tizim orqali siz:\n\n` +
                `📦 Ombordagi mahsulotlarni boshqarishingiz\n` +
                `📊 Kategoriyalar bo'yicha saralashingiz\n` +
                `📱 QR kodlar orqali mahsulotlarni kuzatishingiz\n` +
                `👥 Xodimlarni boshqarishingiz mumkin\n\n` +
                `👇 Tizimga kirish uchun pastdagi tugmani bosing:`;

            await sendMessage(chatId, welcomeText, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '📱 Tizimga Kirish',
                                web_app: { url: APP_URL },
                            },
                        ],
                    ],
                },
            });
        } else if (text === '/help') {
            const helpText = `ℹ️ *Yordam*\n\n` +
                `🔹 /start — Tizimni ishga tushirish\n` +
                `🔹 /help — Yordam\n` +
                `🔹 /about — Tizim haqida\n\n` +
                `📱 Tizimga kirish uchun /start buyrug'ini yuboring va "Tizimga Kirish" tugmasini bosing.`;

            await sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
        } else if (text === '/about') {
            const aboutText = `🏭 *OmborUZ v1.0*\n\n` +
                `Ishlab chiqarish sexi uchun ombor boshqaruv tizimi.\n\n` +
                `✅ Mahsulot qo'shish va boshqarish\n` +
                `✅ QR kod bilan kuzatish\n` +
                `✅ Kategoriya bo'yicha saralash\n` +
                `✅ Xodimlar boshqaruvi\n\n` +
                `⚡ Powered by Tarraqiyot`;

            await sendMessage(chatId, aboutText, { parse_mode: 'Markdown' });
        } else {
            await sendMessage(chatId, '📱 Tizimga kirish uchun /start buyrug\'ini yuboring.', {});
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Bot webhook error:', error);
        return NextResponse.json({ ok: true });
    }
}

async function sendMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            ...options,
        }),
    });
}

// GET - setup webhook
export async function GET(request) {
    try {
        const webhookUrl = `${APP_URL}/api/bot`;
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;

        const response = await fetch(url);
        const data = await response.json();

        return NextResponse.json({
            success: true,
            message: 'Webhook o\'rnatildi',
            data,
            webhookUrl,
        });
    } catch (error) {
        console.error('Webhook setup error:', error);
        return NextResponse.json(
            { success: false, message: 'Webhook xatosi' },
            { status: 500 }
        );
    }
}
