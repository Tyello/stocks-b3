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
  async enviarMensagem(codigoB3, precoAtual, cotacaoAlvo, tipo) {
	try {
	  bot.sendMessage(chatId, `${tipo}! ${codigoB3} atingiu o preço de R$ ${precoAtual} | Cotação alvo R$ ${cotacaoAlvo}`);
	  console.info(`Mensagem enviada com sucesso`);
	} catch (error) {
      console.error(`Erro ao enviar mensagem no Telegram - ${error}`);
	}
  }
}

module.exports = Telegram;
