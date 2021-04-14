const BigNumber = require('bignumber.js');

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
BigNumber.config({ EXPONENTIAL_AT: [-1e9, 1e9] });

class Helper {
  // eslint-disable-next-line class-methods-use-this
  toBN(number) {
    return new BigNumber(number);
  }

  getDecimal() {
    return this.toBN(1e+27);
  }

  fromDecimal(number) {
    return this.toBN(number).dividedBy(1e+27);
  }

  toWei(number) {
    return this.toBN(number).multipliedBy(1e+18);
  }

  fromWei(number) {
    return this.toBN(number).dividedBy(1e+18);
  }

  arrToBNDec(arr) {
    const newArr = [];
    arr.forEach((item) => {
      newArr.push(this.toBN(item).multipliedBy(this.getDecimal()).toString());
    });

    return newArr;
  }

  getWithdrawPercent(deployTime, currentTime, group) {
    let monthPassedIndex = 0;
    while (deployTime + 30 * 24 * 3600 * (monthPassedIndex + 1) <= currentTime) {
      monthPassedIndex++;
    }

    if (monthPassedIndex >= group.percents.length - 1) {
      return this.getDecimal().toString();
    }

    let monthPercent = this.toBN(0);
    for (let k = 0; k <= monthPassedIndex; k++) {
      monthPercent = monthPercent.plus(group.percents[k]);
    }

    const dayWithdrawPercent = this.toBN(group.percents[monthPassedIndex + 1]).dividedBy(30).toFixed(0);
    const daysFromDeploy = this.toBN(currentTime - deployTime).dividedBy(24 * 3600).modulo(30).toFixed(0);
    const daysWithdrawPercent = this.toBN(dayWithdrawPercent).multipliedBy(daysFromDeploy);
    const withdrawPercent = monthPercent.plus(daysWithdrawPercent).toFixed(0);

    return withdrawPercent.toString();
  }

  createCell(val, length) {
    let txt = `| ${String(val).trim()}`;

    while (txt.length < length) {
      txt += ' ';
    }
    txt += ' |';
    return txt;
  }

  createRow(array, length = 9) {
    let row = '';
    array.forEach((item, key) => {
      row += this.createCell(item, length);
      if (key !== array.length - 1) {
        row = row.slice(0, -1);
      }
    });

    return row;
  }
}

module.exports = Helper;
