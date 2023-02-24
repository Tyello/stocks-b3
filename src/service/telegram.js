const TelegramBot = require('node-telegram-bot-api');

// Token do bot do Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;

// ID do chat para onde enviar a mensagem
const chatId = process.env.TELEGRAM_CHAT_ID;

// Criação do bot do Telegram
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
  console.error(`Erro no bot do Telegram: ${error.message}`);
});

class Telegram {
  async sendMessage(symbol, currentPrice, targetPrice, type) {
	try {
	  bot.sendMessage(chatId, `${type}! ${symbol} atingiu o preço de R$ ${currentPrice} | Cotação alvo R$ ${targetPrice}`);
	  console.info(`Mensagem enviada com sucesso`);
	} catch (error) {
      console.error(`Erro ao enviar mensagem no Telegram - ${error}`);
	}
  }
}

module.exports = Telegram;
