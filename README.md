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
- 19 passing tests (Hardhat + Mocha)
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
