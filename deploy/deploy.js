const Root = artifacts.require('Root');
const TokenERC20 = artifacts.require('TokenERC20');

const DataToDeploy = require('./dataToDeploy');

const Helper = require('../test/helpers/helper');

module.exports = async (callback) => {
  console.log('Begin deploy!\n');

  try {
    const h = new Helper();

    const erc20 = await TokenERC20.new();
    const root = await Root.new(erc20.address);

    await erc20.transfer(root.address, h.toBN('127500000000000000000000000'));

    const data = (new DataToDeploy()).getData();

    await root.loadGroupInfo(data.privateRound1, 0);
    await root.loadGroupInfo(data.privateRound2, 1);
    await root.loadGroupInfo(data.unlockedTokenFromPR2, 2);
    await root.loadGroupInfo(data.publicSale, 3);
    await root.loadGroupInfo(data.marketing, 4);
    await root.loadGroupInfo(data.liquidity, 5);
    await root.loadGroupInfo(data.team, 6);
    await root.loadGroupInfo(data.advisors, 7);
    await root.loadGroupInfo(data.development, 8);

    console.log('ERC20:', erc20.address);
    console.log('MainContract:', root.address);
    console.log('\nDone!');
  } catch (e) {
    console.log(e.message);
  }

  callback();
};
