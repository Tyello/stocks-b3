console.log('====================');
console.log('STOCKS-B3');
console.log('====================\n');

// Token do bot do Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;

// ID do chat para onde enviar a mensagem
const chatId = process.env.TELEGRAM_CHAT_ID;

require('dotenv').config();

const Yahoo = require('./service/yahoo');
const serviceYahoo = new Yahoo();

const Fundamentus = require('./service/fundamentus');
const serviceFundamentus = new Fundamentus();

const Telegram = require('./service/Telegram');
const serviceTelegram = new Telegram();

const cron = require('node-cron');


const STOCKS_MAP = new Map([
  //FIIs
  ['XPPR11', 15.00],
  ['XPML11', 92.00],
  ['BTLG11', 91.80],
  ['KNRI11', 125.00],
  ['MXRF11', 13.15],
  ['CPTS11', 97.09],
  ['HCTR11', 119.40],
  //Ações
  ['BBSE3', 28.00],
  ['SANB4', 15.00],
  ['ITSA4', 8.00],
  ['TAEE4', 11.00],
  ['KLBN4', 3.70],
  ['CASH3', 12.30],
  ['IRBR3', 40.00],
  ['B3SA3', 12.00],
]);

const BUY = ['XPPR11', 'XPML11', 'BTLG11', 'KNRI11', 'BBSE3', 'SANB4', 'ITSA4', 'TAEE4', 'KLBN4']
const SELL = ['MXRF11','CPTS11', 'HCTR11', 'CASH3', 'IRBR3'];

const FIIS = ['XPPR11', 'XPML11', 'BTLG11', 'KNRI11', 'MXRF11','CPTS11', 'HCTR11']
//const STOCKS = ['BBSE3', 'SANB4', 'ITSA4', 'TAEE4', 'KLBN4', 'CASH3', 'IRBR3', 'B3SA3']
const STOCKS = ['B3SA3']

//cron.schedule('*/5 9-18 * * 1-5', async () => {
cron.schedule('*/1 * * * 1-5', async () => {
  console.log(`Iniciando consulta de Ações/FIIs ${new Date()}`);
	
  for (const [symbol, targetPrice] of STOCKS_MAP) {
    try {
      const currentPrice = await serviceYahoo.priceData(symbol);

      if (BUY.includes(symbol) && currentPrice <= targetPrice) {
        await serviceTelegram.sendMessage(symbol, currentPrice.toFixed(2), targetPrice.toFixed(2), 'COMPRA');
      } else if (SELL.includes(symbol) && currentPrice > targetPrice) {
        await serviceTelegram.sendMessage(symbol, currentPrice.toFixed(2), targetPrice.toFixed(2), 'VENDA');
      }

      if (STOCKS.includes(symbol)) {
        //serviceYahoo.analyzeStock(symbol);
        serviceFundamentus.analyzeStock(symbol);
      }
    } catch (error) {
      console.error(`Erro ao consultar a ação ${symbol}: ${error.message}`);
    }
  }
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});


if (process.env.NODE_ENV !== 'dev') {
  require('./server');
}