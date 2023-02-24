const axios = require('axios');

const urlBase = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';

class Yahoo {  
  async priceData(symbol) {
    try {
      // URL da API da B3 para cotações
      const url = `${urlBase}/${symbol}.SA?modules=price`;
		
      const response = await axios.get(url);
	  
	    const data = response.data?.quoteSummary?.result?.[0]?.price;
      if (!data) {
        throw new Error(`Dados inválidos para ${symbol}.`);
      }
	  
      const currentPrice = data.regularMarketPrice?.raw;      
      if (!currentPrice) {
        throw new Error(`Preço inválido para ${symbol}.`);
      }

      return currentPrice;
    } catch (error) {
      console.error(error);
      throw new Error(`'Erro ao obter dados da B3 - ${symbol}.`);
    }
  }

  async financialData(symbol) {
    try {
      const url = `${urlBase}/${symbol}.SA?modules=financialData,defaultKeyStatistics`;
      //console.info(url);

      const response = await axios.get(url);

      const json = response.data;
      const quoteSummary = json?.quoteSummary?.result?.[0];
      if (!quoteSummary) {
        throw new Error(`Dados inválidos para ${symbol}.`);
      }

      const financialData = quoteSummary.financialData;
      const keyStatistics = quoteSummary.defaultKeyStatistics;
      return {
        price: financialData.currentPrice.raw,
        bookValue: Object.keys(keyStatistics.bookValue).length !== 0 && keyStatistics.bookValue.constructor === Object ? keyStatistics.bookValue.raw : 0,
        eps: Object.keys(keyStatistics.trailingEps).length !== 0 && keyStatistics.trailingEps.constructor === Object ? keyStatistics.trailingEps.raw : 0,
        dividend: Object.keys(keyStatistics.lastDividendValue).length !== 0 && keyStatistics.lastDividendValue.constructor === Object ? keyStatistics.lastDividendValue.raw : 0,
        fcf: Object.keys(financialData.freeCashflow).length !== 0 && financialData.freeCashflowconstructor === Object ? financialData.freeCashflow.raw : 0,
        roe: Object.keys(financialData.returnOnEquity).length !== 0 && financialData.returnOnEquity.constructor === Object ? financialData.returnOnEquity.raw : 0,
        sharesOutstanding: Object.keys(keyStatistics.sharesOutstanding).length !== 0 && keyStatistics.sharesOutstanding.constructor === Object ? keyStatistics.sharesOutstanding.raw : 0,
        longTermGrowthRate: 0.03, // assume uma taxa de crescimento de longo prazo de 3%
      };
    } catch (error) {
      console.error(error);
      throw new Error(`'Erro ao obter dados da B3 - ${symbol}.`);
    }
  }
  
  calcularPl(financialData) {
    if (financialData.eps === 0 ) {
      return 0;
    }
    return financialData.price / financialData.eps;
  }
  
  calcularPvp(financialData) {
    if (financialData.bookValue === 0 ) {
      return 0;
    }
    return financialData.price / financialData.bookValue;
  }
  
  calcularDividendYield(financialData) {
    if (financialData.price === 0 ) {
      return 0;
    }
    return financialData.dividend / financialData.price;
  }
  
  async analyzeStock(symbol) {
    try{ 
      const financialData = await this.financialData(symbol);
      const pl = this.calcularPl(financialData);
      const pvp = this.calcularPvp(financialData);
      const dividendYield = this.calcularDividendYield(financialData);
      const fcf = financialData.fcf;
      const roe = financialData.roe;
      //const rightPrice = this.calculateRightPrice(financialData);
      //const analyzePrice = this.analyzePrice(financialData.price, rightPrice);
      const intrinsicValue = this.calculateIntrinsicValue(financialData);

      console.log(`=====================================`);
      console.log(`Análise fundamentalista de ${symbol}:`);
      console.log(`- P/L: ${pl.toFixed(2)}`);
      console.log(`- P/VP: ${pvp.toFixed(2)}`);
      console.log(`- Dividend Yield: ${(dividendYield * 100).toFixed(2)}%`);
      console.log(`- FCF: $${fcf.toFixed(2)}`);
      console.log(`- ROE: ${roe.toFixed(2)}%`);
      console.log(`- Preço atual: $${financialData.price.toFixed(2)}`);
      console.log(`- Preço VI: $${intrinsicValue.intrinsicValue}`);
      //console.log(`- Preço justo: $${rightPrice}`);
      //console.log(`- Análise de preço: ${analyzePrice}`);
    } catch (error) {
      console.error(error);
    }
  }

  calculateRightPrice(financialData) {
    const fcf = financialData.fcf;
    const discountRate = financialData.roe;

    let actualPrice = 0;
    for (let i = 1; i <= 5; i++) {
      actualPrice += fcf / ((1 + discountRate) ** i);
    }
    const terminalValue  = (fcf * (1 + financialData.longTermGrowthRate)) / (discountRate - financialData.longTermGrowthRate);
    actualPrice += terminalValue  / ((1 + discountRate) ** 5);
    
    return (actualPrice / financialData.sharesOutstanding).toFixed(2);
  }

  analyzePrice(actualPrice, rightPrice) {
    const margem = 0.1; // margem de 10%
    const margemSuperior = rightPrice * (1 + margem);
    const margemInferior = rightPrice * (1 - margem);
  
    if (actualPrice > margemSuperior) {
      return 'Sobrevalorizado';
    } else if (actualPrice < margemInferior) {
      return 'Subvalorizado';
    } else {
      return 'Preço justo';
    }
  }

  calculateIntrinsicValue(financialData) {
    const growthRate = financialData.longTermGrowthRate;
    const discountRate = financialData.roe;
    const freeCashFlow = financialData.financialData.freeCashflow.raw;
    const sharesOutstanding = financialData.defaultKeyStatistics.sharesOutstanding.raw;
    const enterpriseValue = financialData.financialData.enterpriseValue.raw;
    const bookValue = financialData.defaultKeyStatistics.bookValue.raw;
    const roe = financialData.financialData.returnOnEquity.raw;
  
    const fiveYearFreeCashFlow = freeCashFlow * Math.pow(1 + growthRate, 5);
    const terminalValue = (fiveYearFreeCashFlow * (1 + growthRate)) / (discountRate - growthRate);
    const presentValue = fiveYearFreeCashFlow / Math.pow(1 + discountRate, 5) + terminalValue / Math.pow(1 + discountRate, 5);
    const equityValue = presentValue - enterpriseValue;
    const intrinsicValue = equityValue / sharesOutstanding;
  
    return {
      intrinsicValue: intrinsicValue.toFixed(2),
      enterpriseValue: enterpriseValue.toFixed(2),
      bookValue: bookValue.toFixed(2),
      roe: roe.toFixed(2),
      discountRate: (discountRate * 100).toFixed(2),
      growthRate: (growthRate * 100).toFixed(2),
    };
  }
  
}

module.exports = Yahoo;
