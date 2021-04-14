const { use } = require('chai');
const { solidity } = require('ethereum-waffle');

const Root = artifacts.require('Root');
const TokenERC20 = artifacts.require('TokenERC20');

const Reverter = require('./helpers/reverter');
const Helper = require('./helpers/helper');
const DataToLoad = require('./dataToLoad');
const setCurrentTime = require('./helpers/ganacheTimeTraveler');

use(solidity);
use(require('chai-as-promised')).should();

contract('Root', (accounts) => {
  const reverter = new Reverter(web3);
  const h = new Helper();

  const data = (new DataToLoad()).getDataToLoad(accounts[1], accounts[2], accounts[3], accounts[4]);

  let root;
  let erc20;

  const gasUsageResults = [];
  const gasPrice = 150;
  const ethPrice = 2065;

  before(async () => {
    erc20 = await TokenERC20.new();
    root = await Root.new(erc20.address);

    await erc20.transfer(root.address, h.toBN('127500000000000000000000000'));

    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  describe('check withdraw(), stress', async () => {
    const accountsCount = 80;

    const balances = [];
    for (let i = 0; i < accountsCount; i++) {
      balances.push(h.toWei('162500').toString());
    }
    data.privateRound1.balances = balances;

    const addresses = [];
    for (let i = 1; i <= accountsCount; i++) {
      addresses.push(accounts[i]);
    }
    data.privateRound1.addresses = addresses;

    beforeEach(async () => {
      await root.loadGroupInfo(data.privateRound1, 0);
      await root.loadGroupInfo(data.privateRound2, 1);
      await root.loadGroupInfo(data.unlockedTokenFromPR2, 2);
      await root.loadGroupInfo(data.publicSale, 3);
      await root.loadGroupInfo(data.marketing, 4);
      await root.loadGroupInfo(data.liquidity, 5);
      await root.loadGroupInfo(data.team, 6);
      await root.loadGroupInfo(data.advisors, 7);
      await root.loadGroupInfo(data.development, 8);
    });

    it('should increase withdraw account balance after withdraw', async () => {
      const deployTime = (await root.deployTime()).toNumber();

      const groupNum = 0;

      for (let accNum = 1; accNum <= accountsCount; accNum++) {
        for (let i = 0; i < 3; i++) {
          const currentTime = deployTime + i * 6 * 30 * 24 * 3600 + 60;
          await setCurrentTime(currentTime);

          const toWithdraw = await root.getAvailableToWithdraw(groupNum, { from: accounts[accNum] });

          if (toWithdraw.toString() !== '0') {
            const balanceBeforeWithdraw = h.fromWei(await erc20.balanceOf(accounts[accNum])).toString();

            await root.withdraw(groupNum, toWithdraw.toString(), { from: accounts[accNum] }).then((res) => {
              gasUsageResults.push({
                account: `Account №${accNum}`,
                name: `After ${i * 6} month`,
                toWithdraw: h.fromWei(toWithdraw).toString(),
                balanceAfterWithdraw: balanceBeforeWithdraw,
                gasUsage: res.receipt.gasUsed,
              });
            });
          }
        }
      }
    });

    it('form result', async () => {
      console.log('EthPrice - ', ethPrice);
      console.log('GasPrice - ', gasPrice);
      console.log(h.createRow(['Account', 'Month', 'To withdraw', 'Balance before withdraw', 'Gas usage', 'ETH', 'USD'],
        25));

      gasUsageResults.forEach((obj) => {
        const TransactionETH = (gasPrice * obj.gasUsage) / 10 ** 9;
        const TransactionUSD = TransactionETH * ethPrice;
        console.log(h.createRow([
          obj.account,
          obj.name,
          `${obj.toWithdraw} T`,
          `${obj.balanceAfterWithdraw} T`,
          obj.gasUsage,
          TransactionETH,
          TransactionUSD,
        ], 25));
      });
    });
  });
});
