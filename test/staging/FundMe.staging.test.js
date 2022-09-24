const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

// if we're on developmentChains, skips these tests, else run the tests
developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", function () {
			let fundMe, deployer

			const sendValue = ethers.utils.parseEther("0.1") // 1 ETH

			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer
				fundMe = await ethers.getContract("FundMe", deployer)
				console.log(`✨Deployer Address:✨ ${deployer}`)
			})

			it("Allows people to fund and withdraw", async function () {
				await fundMe.fund({ value: sendValue })
				await fundMe.withdraw()

				const endingBalance = await fundMe.provider.getBalance(
					fundMe.address
				)
				assert(endingBalance.toString(), "0")
			})
	  })
