// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenERC20 is ERC20('Token', 'T') {
    constructor () {
        _mint(msg.sender, 127500000000000000000000000);
    }
}
