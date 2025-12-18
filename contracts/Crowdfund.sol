// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfund is Ownable,ReentrancyGuard {
    mapping(address => uint256) private donations;
    mapping(address=>bool) private hasDonated;
    uint256 public collection;
    uint24 public deadline;
    uint256 public target;
    uint private startTime;
    bool public isFinished;
    bool public isCancelled;

    error NotEnoughEth(address funder);
    error DeadlinePassed();
    error AlreadyClosed();
    error AlreadyCancelled();
    error NotDonated();
    error TargetReached();
    error TargetNotReached();

    event Funded(address funder, uint amount);
    event Refunded(address refunder, uint amount);
    event FundsCollected(uint amount);
    event CrowdfundCancelled();

    constructor(uint24 _deadline, uint256 _target) Ownable(msg.sender) {
        deadline = _deadline;
        target = _target;
        startTime = block.timestamp;
        isFinished = false;
    }

    function fund() public payable {
        if (block.timestamp > startTime + deadline) {
            revert DeadlinePassed();
        }
        if (msg.value == 0) {
            revert NotEnoughEth(msg.sender);
        }
        if (isFinished) {
            revert AlreadyClosed();
        }
        if(isCancelled){
            revert AlreadyCancelled();
        }
        donations[msg.sender] += msg.value;
        hasDonated[msg.sender] = true;
        collection += msg.value;
        emit Funded(msg.sender,msg.value);
    }

    function collect() public onlyOwner nonReentrant() {
        if (isFinished == true) {
            revert AlreadyClosed();
        }
        if(isCancelled == true){
            revert AlreadyCancelled();
        }
        if (collection < target) {
            revert TargetNotReached();
        }
        if (collection >= target) {
            isFinished = true;
            address contractOwner = owner();
            (bool success, ) = payable(contractOwner).call{value: collection}("");
            require(success);
            emit FundsCollected(collection);
        }
    }

    function cancel() public onlyOwner {
        if (isFinished == true) {
            revert AlreadyClosed();
        }
        if(isCancelled){
            revert AlreadyCancelled(); 
        }
        isCancelled = true;
        emit CrowdfundCancelled();
    }

    function refund() public nonReentrant(){
        if (isFinished == true) {
            revert AlreadyClosed();
        }
        if (!hasDonated[msg.sender]) {
            revert NotDonated();
        }
        if (collection >= target && isCancelled == false) {
            revert TargetReached();
        }
        hasDonated[msg.sender] = false;
        uint amount = donations[msg.sender];
        collection-= amount;
        donations[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success);
        emit Refunded(msg.sender,amount);
    }

    function viewFundedAmount() public view returns(uint){
        if(!hasDonated[msg.sender]){
            revert NotDonated();
        }
        return donations[msg.sender];
    }
}
