# Crowdfund Smart Contract

A secure Ethereum crowdfunding smart contract built with Solidity and Hardhat.

## Features
- Deadline-based crowdfunding
- Refunds if target is not met
- Owner-only fund collection
- Emergency cancellation
- Reentrancy protection using OpenZeppelin ReentrancyGuard

## Security
- Protected against reentrancy attacks
- Refund logic tested with a malicious attacker contract
- Access control enforced using OpenZeppelin Ownable

## Testing
- Comprehensive unit and edge-case tests
- 20 passing tests (Hardhat + Mocha)
- Tests cover funding, refunds, cancellation, and collection logic

## Tech Stack
- Solidity ^0.8.x
- Hardhat 3.x
- Ethers.js
- OpenZeppelin Contracts

## How to Run

Install dependencies:

```bash
pnpm install

## Deployed Contract (Sepolia Testnet)

You can interact with the deployed Crowdfund contract here:

- Contract address: [0x42495A683C5C084d0A6B9F5e545e274cB5e75748](https://sepolia.etherscan.io/address/0x42495A683C5C084d0A6B9F5e545e274cB5e75748)
- Network: Sepolia
