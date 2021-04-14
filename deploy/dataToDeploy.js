const Helper = require('../test/helpers/helper');

const h = new Helper();

class DataToDeploy {
  getData() {
    return {
      privateRound1: {
        balances: [h.toWei('10000000').toString(), h.toWei('3000000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0.15, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.07, 0.06, 0.06, 0.06, 0.06, 0.06]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      privateRound2: {
        balances: [h.toWei('18000000').toString(), h.toWei('527508').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0.15, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.07, 0.06, 0.06, 0.06, 0.06, 0.06]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      unlockedTokenFromPR2: {
        balances: [h.toWei('6000000').toString(), h.toWei('472492').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([1]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      publicSale: {
        balances: [h.toWei('500000').toString(), h.toWei('500000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([1]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      marketing: {
        balances: [h.toWei('12000000').toString(), h.toWei('500000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0.15, 0.085, 0.085, 0.085, 0.085, 0.085, 0.075, 0.075, 0.075, 0.05, 0.05, 0.05, 0.05]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      liquidity: {
        balances: [h.toWei('20000000').toString(), h.toWei('20000000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0.07, 0.085, 0.085, 0.085, 0.075, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      team: {
        balances: [h.toWei('10000000').toString(), h.toWei('5000000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.075, 0.075, 0.1, 0.075, 0.075,
          0.1, 0.075, 0.075, 0.1, 0.075, 0.075]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      advisors: {
        balances: [h.toWei('2500000').toString(), h.toWei('2500000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.075, 0.075, 0.1, 0.075, 0.075,
          0.1, 0.075, 0.075, 0.1, 0.075, 0.075]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
      development: {
        balances: [h.toWei('10000000').toString(), h.toWei('6000000').toString()],
        balancesBase: [],
        percents: h.arrToBNDec([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.075, 0.075, 0.1, 0.075, 0.075,
          0.1, 0.075, 0.075, 0.1, 0.075, 0.075]),
        addresses: ['0x0a564013d50D7ED83870EC12742909a519e3f8F7', '0x0a564013d50D7ED83870EC12742909a519e3f8F7'],
      },
    };
  }
}

module.exports = DataToDeploy;
