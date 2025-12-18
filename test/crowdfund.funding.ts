import { expect } from "chai";
import { network } from "hardhat";
import type { Crowdfund } from "../types/ethers-contracts";
import { type Signer } from "ethers";

const { ethers } = await network.connect();

describe("funding", function () {
    let owner:Signer, acc1:Signer, acc2:Signer,crowdfund:Crowdfund;
    beforeEach(async function () {
        [owner, acc1, acc2] = await ethers.getSigners();
        crowdfund = await ethers.deployContract("Crowdfund", [30, ethers.parseEther("100")]);
        await crowdfund.waitForDeployment();
    })
    it("Should fund successfully", async function () {
        await expect(crowdfund.connect(acc1).fund({ value: ethers.parseEther("5") })).to.emit(crowdfund, "Funded").withArgs(await acc1.getAddress(), ethers.parseEther("5"));
    })
    it("Should update balance",async function(){
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("7") });
        expect(await crowdfund.collection()).to.equal(ethers.parseEther("7"));
    })
    it("Should refund before deadline",async function () {
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("7") });
        await expect(crowdfund.connect(acc2).refund()).to.emit(crowdfund,"Refunded").withArgs(await acc2.getAddress(),ethers.parseEther("7"));
        expect(await crowdfund.collection()).to.equal(ethers.parseEther("0"));
    })
    it("Should not refund if target met",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("7") });
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("93") });
        await expect(crowdfund.connect(acc2).refund()).to.be.revertedWithCustomError(crowdfund,"TargetReached");
    })
    it("Should allow double fund",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("7") });
        await crowdfund.connect(acc1).fund({value:ethers.parseEther("80")});
        const fundedAmount = await crowdfund.connect(acc1).viewFundedAmount();
        expect(fundedAmount).to.equal(ethers.parseEther("87"));
    })
    it("Should allow fund even after target met",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("7") });
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("93") });
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("93") });
        expect(await crowdfund.collection()).to.equal(ethers.parseEther("193")); 
    })
    it("Should not refund if never donated",async function () {
        await expect(crowdfund.connect(acc2).refund()).to.revertedWithCustomError(crowdfund,"NotDonated");
    })
    it("Should not fund zero eth",async function () {
        await expect(crowdfund.connect(acc1).fund({ value: ethers.parseEther("0") })).to.be.revertedWithCustomError(crowdfund,"NotEnoughEth");
        await expect(crowdfund.connect(acc1).viewFundedAmount()).to.revertedWithCustomError(crowdfund,"NotDonated");
    })
    it("Should not fund after cancellation",async function () {
        await crowdfund.connect(owner).cancel();
        await expect(crowdfund.connect(acc1).fund({ value: ethers.parseEther("10") })).to.be.revertedWithCustomError(crowdfund,"AlreadyCancelled");
    })
    it("Should allow refund after cancellation",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("10") });
        await crowdfund.connect(owner).cancel();
        await expect(crowdfund.connect(acc1).refund()).to.emit(crowdfund,"Refunded").withArgs(await acc1.getAddress(),ethers.parseEther("10"));
    })
    it("Should not refund after deadline if target met",async function () {
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("7") });
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("93") });
        await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
        await expect(crowdfund.connect(acc2).refund()).to.be.revertedWithCustomError(crowdfund,"TargetReached");
    })
    it("Should revert when view funded amount if never donated",async function () {
        await expect(crowdfund.connect(acc2).viewFundedAmount()).to.revertedWithCustomError(crowdfund,"NotDonated");
    });
})