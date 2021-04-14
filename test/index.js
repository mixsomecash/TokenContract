const { use, expect } = require('chai');
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

  const OLEG = accounts[1];
  const IVAN = accounts[2];
  const LIDA = accounts[3];
  const GALA = accounts[4];

  let data = (new DataToLoad()).getDataToLoad(OLEG, IVAN, LIDA, GALA);

  let root;
  let erc20;

  before(async () => {
    erc20 = await TokenERC20.new();
    root = await Root.new(erc20.address);

    await erc20.transfer(root.address, h.toBN('127500000000000000000000000'));

    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  describe('check loadGroupInfo()', async () => {
    beforeEach(async () => {
      data = (new DataToLoad()).getDataToLoad(OLEG, IVAN, LIDA, GALA);
    });

    it('should transfer tokens on deploy (Public sale...)', async () => {
      await root.loadGroupInfo(data.privateRound1, 0);
      await root.loadGroupInfo(data.privateRound2, 1);
      await root.loadGroupInfo(data.unlockedTokenFromPR2, 2);
      await root.loadGroupInfo(data.publicSale, 3);
      await root.loadGroupInfo(data.marketing, 4);
      await root.loadGroupInfo(data.liquidity, 5);
      await root.loadGroupInfo(data.team, 6);
      await root.loadGroupInfo(data.advisors, 7);
      await root.loadGroupInfo(data.development, 8);

      const LidaBalanceOnDeploy = h.toBN(data.publicSale.balances[0]).plus(data.unlockedTokenFromPR2.balances[0]);
      assert.equal((await erc20.balanceOf(LIDA)).toString(), LidaBalanceOnDeploy.toString());

      const GalaBalanceOnDeploy = h.toBN(data.publicSale.balances[1]).plus(data.unlockedTokenFromPR2.balances[1]);
      assert.equal((await erc20.balanceOf(GALA)).toString(), GalaBalanceOnDeploy.toString());
    });

    it('should revert if total balance not equal count of minted tokens', async () => {
      data.privateRound1.balances = ['1'];
      data.privateRound1.addresses = [OLEG];

      await root.loadGroupInfo(data.privateRound1, 0);
      await root.loadGroupInfo(data.privateRound2, 1);
      await root.loadGroupInfo(data.unlockedTokenFromPR2, 2);
      await root.loadGroupInfo(data.publicSale, 3);
      await root.loadGroupInfo(data.marketing, 4);
      await root.loadGroupInfo(data.liquidity, 5);
      await root.loadGroupInfo(data.team, 6);
      await root.loadGroupInfo(data.advisors, 7);

      await expect(root.loadGroupInfo(data.development, 8))
        .to.be.revertedWith('E-96');
    });

    it('should revert if percent in group not set or sum les then 1', async () => {
      data.privateRound1.percents = [];

      await expect(root.loadGroupInfo(data.privateRound1, 0))
        .to.be.revertedWith('E-104');
    });

    it('should revert if addresses length in group not equal to balances length', async () => {
      data.privateRound1.addresses = [OLEG];
      data.privateRound1.balances = ['1', '2'];

      await expect(root.loadGroupInfo(data.privateRound1, 0))
        .to.be.revertedWith('E-50');
    });

    it('should revert if addresses in group not set', async () => {
      data.privateRound1.addresses = [];

      await expect(root.loadGroupInfo(data.privateRound1, 0))
        .to.be.revertedWith('E-40');
    });

    it('should revert if group already loaded', async () => {
      await root.loadGroupInfo(data.privateRound1, 0);

      await expect(root.loadGroupInfo(data.privateRound1, 0))
        .to.be.revertedWith('E-39');
    });
  });

  describe('check getWithdrawPercent()', async () => {
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

    it('should increase withdraw percent every month', async () => {
      const deployTime = (await root.deployTime()).toNumber();

      let groupNum = 0;

      for (const group in data) {
        for (let i = 0; i < data[group].percents.length * 10; i++) {
          const currentTime = deployTime + i * 3 * 24 * 3600 + 60;
          await setCurrentTime(currentTime);

          const solPercent = (await root.getWithdrawPercent(groupNum)).toString();
          const calcPercent = h.getWithdrawPercent(deployTime, currentTime, data[group]);

          assert.equal(solPercent, calcPercent);
        }

        groupNum++;
      }
    });
  });

  describe('check getAvailableToWithdraw()', async () => {
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

    it('should increase withdraw amount every month', async () => {
      const deployTime = (await root.deployTime()).toNumber();

      let groupNum = 0;

      for (const group in data) {
        for (let i = 0; i < data[group].percents.length * 10; i++) {
          const currentTime = deployTime + i * 3 * 24 * 3600 + 60;
          await setCurrentTime(currentTime);

          const calcPercent = h.getWithdrawPercent(deployTime, currentTime, data[group]);
          const toWithdraw = h.toBN(data[group].balances[0]).multipliedBy(calcPercent).dividedBy(h.getDecimal());

          if (data[group].percents[0] === h.getDecimal().toString()) {
            assert.equal((await root.getAvailableToWithdraw(groupNum, { from: LIDA })).toString(), '0');
          } else {
            assert.equal((await root.getAvailableToWithdraw(groupNum, { from: OLEG })).toString(),
              toWithdraw.toFixed(0));
          }
        }
        groupNum++;
      }
    });

    it('should increase withdraw amount every month considering withdrawal of tokens', async () => {
      const deployTime = (await root.deployTime()).toNumber();

      let groupNum = 0;
      const withdrawAmount = h.toWei(3).toString();
      let withdrawCounter = 0;

      for (const group in data) {
        withdrawCounter = 0;

        for (let i = 0; i < data[group].percents.length * 3; i++) {
          const currentTime = deployTime + i * 10 * 24 * 3600 + 60;
          await setCurrentTime(currentTime);

          let toWithdraw = 0;

          const calcPercent = h.getWithdrawPercent(deployTime, currentTime, data[group]);
          if (data[group].percents[0] !== h.getDecimal().toString() && calcPercent !== '0') {
            await root.withdraw(groupNum, withdrawAmount, { from: OLEG });
            withdrawCounter += 1;

            toWithdraw = h.toBN(data[group].balances[0]).multipliedBy(calcPercent).dividedBy(h.getDecimal())
              .minus(h.toBN(withdrawAmount).multipliedBy(withdrawCounter));
          }

          if (data[group].percents[0] === h.getDecimal().toString()) {
            assert.equal((await root.getAvailableToWithdraw(groupNum, { from: LIDA })).toString(), '0');
          } else {
            assert.equal((await root.getAvailableToWithdraw(groupNum, { from: OLEG })).toString(),
              toWithdraw.toFixed(0));
          }
        }

        groupNum++;
      }
    });

    it('should revert if address not set in group', async () => {
      await expect(root.getAvailableToWithdraw(2, { from: OLEG })).to.be.revertedWith('E-55');
    });
  });

  describe('check withdraw()', async () => {
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

      let groupNum = 0;
      let totalWithdrawAmount = h.toBN(0);

      for (const group in data) {
        for (let i = 0; i < data[group].percents.length * 3; i++) {
          const currentTime = deployTime + i * 10 * 24 * 3600 + 60;
          await setCurrentTime(currentTime);

          const calcPercent = h.getWithdrawPercent(deployTime, currentTime, data[group]);
          if (data[group].percents[0] !== h.getDecimal().toString() && calcPercent !== '0') {
            const toWithdraw = await root.getAvailableToWithdraw(groupNum, { from: OLEG });
            if (toWithdraw.toString() !== '0') {
              await root.withdraw(groupNum, toWithdraw.toString(), { from: OLEG });
              totalWithdrawAmount = totalWithdrawAmount.plus(toWithdraw.toString());
            }
          }

          const userBalance = (await erc20.balanceOf(OLEG)).toString();
          assert.equal(userBalance, totalWithdrawAmount.toString());
        }

        groupNum++;
      }

      let balanceShouldBe = h.toBN(0);
      for (const group in data) {
        if (data[group].addresses[0] === OLEG) {
          balanceShouldBe = balanceShouldBe.plus(data[group].balances[0]);
        }
      }
      assert.equal((await erc20.balanceOf(OLEG)).toString(), balanceShouldBe.toString());
    });

    it('should revert when user haven\'t available to withdraw', async () => {
      const deployTime = (await root.deployTime()).toNumber();

      let groupNum = 0;

      for (const group in data) {
        for (let i = 0; i < data[group].percents.length * 3; i++) {
          const currentTime = deployTime + i * 10 * 24 * 3600 + 60;
          await setCurrentTime(currentTime);

          const calcPercent = h.getWithdrawPercent(deployTime, currentTime, data[group]);
          if (data[group].percents[0] !== h.getDecimal().toString() && calcPercent !== '0') {
            const toWithdraw = await root.getAvailableToWithdraw(groupNum, { from: OLEG });
            if (toWithdraw.toString() !== '0') {
              await root.withdraw(groupNum, toWithdraw.toString(), { from: OLEG });
            }

            await expect(root.withdraw(groupNum, '1', { from: OLEG })).to.be.revertedWith('E-51');
          }
        }

        groupNum++;
      }
    });
  });
});
