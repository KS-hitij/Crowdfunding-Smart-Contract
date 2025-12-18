import { expect } from "chai";
import { network } from "hardhat";
import type { Crowdfund } from "../types/ethers-contracts";
import { type Signer } from "ethers";

const { ethers } = await network.connect();

describe("collection", function () {
    let owner:Signer, acc1:Signer, acc2:Signer,crowdfund:Crowdfund;
    beforeEach(async function () {
        [owner, acc1, acc2] = await ethers.getSigners();
        crowdfund = await ethers.deployContract("Crowdfund", [30, ethers.parseEther("100")]);
        await crowdfund.waitForDeployment();
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("20") });
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("30") });
    })
    it("Should allow owner to collect after target met",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("50") });
        await expect(crowdfund.connect(owner).collect()).to.emit(crowdfund,"FundsCollected").withArgs(ethers.parseEther("100"));
        expect(await crowdfund.isFinished()).to.be.equal(true);
        expect(await crowdfund.isCancelled()).to.be.equal(false);
    })
    it("Should not allow non-owner to collect",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("50") });
        await expect(crowdfund.connect(acc1).collect()).to.be.revertedWithCustomError(crowdfund,"OwnableUnauthorizedAccount");
    })
    it("Should allow owner to collect more than target",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("80") });
        await expect(crowdfund.connect(owner).collect()).to.emit(crowdfund,"FundsCollected").withArgs(ethers.parseEther("130"));
        expect(await crowdfund.isFinished()).to.be.equal(true);
    })
    it("Should not allow collect before target met",async function () {
        await expect(crowdfund.connect(owner).collect()).to.be.revertedWithCustomError(crowdfund,"TargetNotReached");
    })
    it("Should not allow collect after cancellation",async function () {
        await crowdfund.connect(owner).cancel();
        await expect(crowdfund.connect(owner).collect()).to.be.revertedWithCustomError(crowdfund,"AlreadyCancelled");
    })
    it("Should not allow collect after deadline if target not met",async function () {
        await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
        await expect(crowdfund.connect(owner).collect()).to.be.revertedWithCustomError(crowdfund,"TargetNotReached");
    })
    it("Should allow collect after deadline if target met",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("50") });
        await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
        await expect(crowdfund.connect(owner).collect()).to.emit(crowdfund,"FundsCollected").withArgs(ethers.parseEther("100"));
        expect(await crowdfund.isFinished()).to.be.equal(true);
    })
})