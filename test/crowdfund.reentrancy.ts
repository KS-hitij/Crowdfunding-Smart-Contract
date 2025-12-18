import { expect } from "chai";
import { network } from "hardhat";
import type { Crowdfund } from "../types/ethers-contracts";
import { type Signer } from "ethers";

const { ethers } = await network.connect();

describe("reentrancy", function () {
    let owner:Signer, acc1:Signer, acc2:Signer,crowdfund:Crowdfund;
    beforeEach(async function () {
        [owner, acc1, acc2] = await ethers.getSigners();
        crowdfund = await ethers.deployContract("Crowdfund", [30, ethers.parseEther("100")]);
        await crowdfund.waitForDeployment();
        await crowdfund.connect(acc1).fund({ value: ethers.parseEther("20") });
        await crowdfund.connect(acc2).fund({ value: ethers.parseEther("30") });
    })
    it("should not allow reentrancy on refund", async () => {
        const attacker = await ethers.deployContract("Attacker", [crowdfund.target]);
        await expect(attacker.attack({ value: ethers.parseEther("1") })).to.be.revert;
    });
});
