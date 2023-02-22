console.log('====================');
console.log('STOCKS-B3');
console.log('====================\n');

// Token do bot do Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;

// ID do chat para onde enviar a mensagem
const chatId = process.env.TELEGRAM_CHAT_ID;

require('dotenv').config();

const B3 = require('./service/B3');
const serviceB3 = new B3();
const Telegram = require('./service/Telegram');
const serviceTelegram = new Telegram();

const { setTimeout } = require('timers');


const COMPRA_ACOES_MAP = new Map([
  //FIIs
  ['XPPR11', 25.00],
  ['XPML11', 92.00],
  ['BTLG11', 92.80],
  ['KNRI11', 125.00],
  //Ações
  ['BBSE3', 28.00],
  ['SANB4', 15.00],
  ['ITSA4', 8.00],
  ['TAEE4', 11.00],
  ['KLBN4', 3.70],
]);

const VENDA_ACOES_MAP = new Map([
  //FIIs
  ['MXRF11', 10.15],
  ['CPTS11', 78.09],
  ['HCTR11', 89.40],
  //Ações
  ['CASH3', 2.30],
  ['IRBR3', 40.00],
]);

const intervalo = 300000; // intervalo de consulta em milissegundos (300 segundos)

setInterval(async () => {
  console.log(`Iniciando consulta ações ${new Date()}`);
	
  for (const [codigo, cotacaoAlvo] of COMPRA_ACOES_MAP) {
	try {
	  const precoAtual = await serviceB3.solicitarDadosB3Summary(codigo);

	  if (precoAtual <= cotacaoAlvo) {
		serviceTelegram.enviarMensagem(codigo, precoAtual.toFixed(2), cotacaoAlvo.toFixed(2), 'Compra');
	  }
	} catch (error) {
	  console.error(`Erro ao consultar a ação ${codigo}: ${error.message}`);
	}
  }
  
  for (const [codigo, cotacaoAlvo] of VENDA_ACOES_MAP) {
	try {
	  const precoAtual = await serviceB3.solicitarDadosB3Summary(codigo);

	  if (precoAtual > cotacaoAlvo) {
		serviceTelegram.enviarMensagem(codigo, precoAtual.toFixed(2), cotacaoAlvo.toFixed(2), 'Venda');
	  }
	} catch (error) {
	  console.error(`Erro ao consultar a ação ${codigo}: ${error.message}`);
	}
  }
}, intervalo);


if (process.env.NODE_ENV !== 'dev') {
  require('./server');
}