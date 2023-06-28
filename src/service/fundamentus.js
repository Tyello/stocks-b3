const axios = require('axios');

const urlBase = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';

const fs = require('fs');
const path = require('path');

const stocksFile = path.join(__dirname, '../files', 'stocks.txt');

class Fundamentus { 
  
  async analyzeStock(symbol) {
    try{ 
      console.log(`=====================================`);
      console.log(`Análise fundamentalista de ${symbol}:`);
      this.readFile();
    } catch (error) {
      console.error(error);
    }
  }

  async readFile() {
    try {
      const stream = fs.createReadStream(stocksFile, { encoding: 'utf8' });
      let remaining = '';

      stream.on('data', (chunk) => {
        const lines = (remaining + chunk).split('\n');
        remaining = lines.pop();

        lines.forEach((line) => {
          const [acao, cotacao, PL, PVP, PSR, DY, pAtivo, pCapGiro, pEBIT, pAtivCircLiq, evEBIT, evEBITDA, mrgEBIT, mrgLiq, liqCorr, ROIC, ROE, liq2meses, patrLiq, divBrutPatrim, crescRec5a] = line.split(';');
          
          // Cálculo do valor intrínseco
          const valorIntrinseco = cotacao * (PL / ROE);

          // Análise fundamentalista
          const precoJusto = valorIntrinseco;
          const margemSeguranca = ((precoJusto - cotacao) / cotacao) * 100;
          //const intrinsicValue = this.calculateIntrinsicValue(PL, PVP, PSR, DY, pAtivo, pCapGiro, pEBIT, pAtivCircLiq, evEBIT, evEBITDA, mrgEBIT, mrgLiq, liqCorr, ROIC, ROE, liq2meses, patrLiq, divBrutPatrim, crescRec5a);
          
          console.log(`- Preço atual: $${cotacao}`);

          console.log('=== Análise Fundamentalista ===');
          console.log('Preço Justo:', precoJusto);
          console.log('Margem de Segurança:', margemSeguranca);
          
          // Outras informações importantes
          console.log('=== Outras Informações ===');
          console.log('Valor Intrínseco:', valorIntrinseco);
        });
      });

      stream.on('end', () => {
        if (remaining) {
          const [acao, cotacao, PL, PVP, PSR, DY, pAtivo, pCapGiro, pEBIT, pAtivCircLiq, evEBIT, evEBITDA, mrgEBIT, mrgLiq, liqCorr, ROIC, ROE, liq2meses, patrLiq, divBrutPatrim, crescRec5a] = remaining.split(';');
          // Cálculo do valor intrínseco
          const valorIntrinseco = cotacao * (PL / ROE);

          // Análise fundamentalista
          const precoJusto = valorIntrinseco;
          const margemSeguranca = ((precoJusto - cotacao) / cotacao) * 100;
          //const intrinsicValue = this.calculateIntrinsicValue(PL, PVP, PSR, DY, pAtivo, pCapGiro, pEBIT, pAtivCircLiq, evEBIT, evEBITDA, mrgEBIT, mrgLiq, liqCorr, ROIC, ROE, liq2meses, patrLiq, divBrutPatrim, crescRec5a);
          
          console.log(`- Preço atual: $${cotacao}`);

          console.log('=== Análise Fundamentalista ===');
          console.log('Preço Justo:', precoJusto);
          console.log('Margem de Segurança:', margemSeguranca);
          
          // Outras informações importantes
          console.log('=== Outras Informações ===');
          console.log('Valor Intrínseco:', valorIntrinseco);
        }
      })
    } catch (error) {
      console.error(error);
      throw new Error(`'Erro ao obter dados do arquivo - ${symbol}.`);
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

  calculateIntrinsicValue(PL, PVP, PSR, DY, pAtivo, pCapGiro, pEBIT, pAtivCircLiq, evEBIT, evEBITDA, mrgEBIT, mrgLiq, liqCorr, ROIC, ROE, liq2meses, patrLiq, divBrutPatrim, crescRec5a) {
    const fatorPL = 10; // Fator de peso para o PL
    const fatorPVP = 7; // Fator de peso para o PVP
    const fatorPSR = 5; // Fator de peso para o PSR
    const fatorDY = 4; // Fator de peso para o DY
    const fatorpAtivo = 3; // Fator de peso para o pAtivo
    const fatorpCapGiro = 2; // Fator de peso para o pCapGiro
    const fatorpEBIT = 2; // Fator de peso para o pEBIT
    const fatorpAtivCircLiq = 1; // Fator de peso para o pAtivCircLiq
    const fatorEV = 1; // Fator de peso para o EV/EBIT
    const fatorEVDA = 1; // Fator de peso para o EV/EBITDA
    const fatorMargemEBIT = 3; // Fator de peso para a margem EBIT
    const fatorMargemLiq = 2; // Fator de peso para a margem líquida
    const fatorLiquidezCorr = 1; // Fator de peso para a liquidez corrente
    const fatorROIC = 3; // Fator de peso para o ROIC
    const fatorROE = 3; // Fator de peso para o ROE
    const fatorLiquidez2Meses = 1; // Fator de peso para a liquidez em 2 meses
    const fatorPatrimonioLiquido = 2; // Fator de peso para o patrimônio líquido
    const fatorDivBrutPatrim = 1; // Fator de peso para a dívida bruta/patrimônio líquido
    const fatorCrescRec5a = 2; // Fator de peso para o crescimento recente em 5 anos

    const valorIntrinseco =
      (PL * fatorPL +
        PVP * fatorPVP +
        PSR * fatorPSR +
        DY * fatorDY +
        pAtivo * fatorpAtivo +
        pCapGiro * fatorpCapGiro +
        pEBIT * fatorpEBIT +
        pAtivCircLiq * fatorpAtivCircLiq +
        evEBIT * fatorEV +
        evEBITDA * fatorEVDA +
        mrgEBIT * fatorMargemEBIT +
        mrgLiq * fatorMargemLiq +
        liqCorr * fatorLiquidezCorr +
        ROIC * fatorROIC +
        ROE * fatorROE +
        liq2meses * fatorLiquidez2Meses +
        patrLiq * fatorPatrimonioLiquido +
        divBrutPatrim * fatorDivBrutPatrim +
        crescRec5a * fatorCrescRec5a) /
      (fatorPL +
        fatorPVP +
        fatorPSR +
        fatorDY +
        fatorpAtivo +
        fatorpCapGiro +
        fatorpEBIT +
        fatorpAtivCircLiq +
        fatorEV +
        fatorEVDA +
        fatorMargemEBIT +
        fatorMargemLiq +
        fatorLiquidezCorr +
        fatorROIC +
        fatorROE +
        fatorLiquidez2Meses +
        fatorPatrimonioLiquido +
        fatorDivBrutPatrim +
        fatorCrescRec5a);

    return valorIntrinseco;
  }
  
}

module.exports = Fundamentus;
