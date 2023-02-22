const axios = require('axios');

const summaryUrlBase = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';

class B3 {  
  async solicitarDadosB3Summary(codigo) {
    try {
	  // URL da API da B3 para cotações
	  const url = `${summaryUrlBase}/${codigo}.SA?modules=price`;
		
      const response = await axios.get(url);
	  
	  const data = response.data?.quoteSummary?.result?.[0]?.price;
      if (!data) {
        throw new Error(`Dados inválidos para ${codigo}.`);
      }
	  
      const precoAtual = data.regularMarketPrice?.raw;      
      if (!precoAtual) {
        throw new Error(`Preço inválido para ${codigo}.`);
      }

      return precoAtual;
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao obter dados da B3.');
    }
  }
}

module.exports = B3;
