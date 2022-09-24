const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

// unit test for the entire fundMe contract

// if we're not on developmentChains, skips these tests, else run the tests
!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", function () {
			let fundMe, deployer, mockV3Aggregator
			const sendValue = ethers.utils.parseEther("1") // 1 ETH

			// deploy the contract
			beforeEach(async function () {
				// deploy contract using hardhat-deploy before running the test

				// 1- specify which account we want connected to fundMe
				deployer = (await getNamedAccounts()).deployer

				/* another way to get accounts is directly from the hardhat.config.js
				 * Example:
				 *   const accounts = await ethers.getSigners()
				 *   // ethers.getSigners() will return the accounts from the accounts: [PRIVATE_KEY] section of hardhat config file if we're on a testnet or mainnet
				 *   // or it will give us 10 fake accounts if we're on the default hardhat local network
				 *   // then we access those accounts like so:
				 *   const accountZero = accounts[0]
				 */

				// 2- deploy all contracts with deployments.fixture
				// deployments.fixture will run through all the deploy scripts with the "all" tag on a local hardhat network and deploy all the contracts
				await deployments.fixture(["all"])

				// 3- get the recently deployed contracts
				// getContract() is a hardhat-deploy function wrapped over ethers,
				// it gets the most recent deployment of whatever contract we pass in
				// get the FundMe contract
				fundMe = await ethers.getContract("FundMe", deployer) // connected deployer to fundMe contract so that all the function calls will be from that deployer account

				// get the MockV3Aggregator contract
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer
				)
			})

			// tests for the constructor() function
			describe("constructor", function () {
				it("Sets the aggregator addresses correctly", async function () {
					const response = await fundMe.getPriceFeed()

					assert.equal(response, mockV3Aggregator.address)
				})

				it("Deployer is the Owner", async function () {
					const response = await fundMe.getOwner()
					assert.equal(response, deployer)
				})
			})

			// tests for fund()
			describe("fund", function () {
				it("Fails if you don't send enough ETH", async function () {
					// test if a txn was reverted with the exact message as the message in the "require" or "revert" statement in FundMe.sol
					await expect(fundMe.fund()).to.be.revertedWith(
						"FundMe__NotEnoughETH()"
					)
				})

				it("updates the amound funded data structure", async function () {
					await fundMe.fund({ value: sendValue })

					const response = await fundMe.getAddressToAmountFunded(
						deployer
					)
					assert.equal(response.toString(), sendValue.toString())
				})

				it("Add funders to array of funders", async function () {
					await fundMe.fund({ value: sendValue })
					const funder = await fundMe.getFunder(0) // checking the 0th index of funders array

					assert.equal(funder, deployer)
				})
			})

			// tests for withdraw()
			describe("withdraw", function () {
				// in order to test withdraw(), first let's put some money in the contract
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue }) // put 1 ETH into the contract
				})

				it("Withdraw ETH from a single funder", async function () {
					// 1- Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address) // starting balance of FundMe (before withdrawal)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer) // starting balance of owner (before withdrawal)

					// 2- Act (Withdraw)
					const transactionResponse = await fundMe.withdraw()
					const transactionReceipt = await transactionResponse.wait(1) // wait for 1 block confirmation

					// gasUsed & gasPrice
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice) // gasCost = gasUsed * effectiveGasPrice

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address) // balance of FundMe contract after withdrawal
					console.log(`EndingFundMeBalance: ${endingFundMeBalance}`)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer) // balance of owner after withdrawal
					console.log(
						`Ending Deployer Balance: ${endingDeployerBalance}`
					)

					//3- Assert
					// ending balance of contract must be 0
					assert.equal(endingFundMeBalance, 0)

					// check if balance got credited to deployer after withdrawal
					// here's the logic:
					// startingFundMeBalace + startingDeployerBalance == endDeployerBalancer + any gas fee deployer paid to call withdraw()
					// since the balances are in BigNumber, we cannot use the + mathematical operation. So, we make use of .add() method from Ethers' BigNumber class
					// and then to compare, we have to typecast both values to string, since BigNumbers are Objects.

					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
				})

				// test for withdraw from multiple funders
				it("Allows us to withdraw with multiple funders", async function () {
					// 1- Arrange
					// create mutiple accounts to fund the contract
					const accounts = await ethers.getSigners()

					// fund the contract with these 5 accounts
					for (let i = 1; i < 6; i++) {
						// printing list of accounts created in local hardhat network
						// In this loop, we start from 1st index,
						// since deployer account is at the 0th index because we created it in the beginning (in the first beforeEach) when we deployed the contract for tests

						// create a new object of fundMe contract and connect it with these accounts, so that we can call contract functions with these accounts
						// since fundMe is connected to the deployer account, and we do not want to call contract functions with deployer account here
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						)

						// send funds from each account
						await fundMeConnectedContract.fund({ value: sendValue })
					}

					// get starting balances
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)

					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// 2- Act (withdraw)
					const transactionResponse = await fundMe.withdraw()
					const transactionReceipt = await transactionResponse.wait(1)

					// gasCost & gasPrice
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					console.log(`EndingFundMeBalance: ${endingFundMeBalance}`)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// 3- Assert
					assert.equal(endingFundMeBalance, 0)

					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)

					console.log(
						`Ending Deployer Balance after multiple funders withdrawal: ${endingDeployerBalance}`
					)

					// make sure the funders array is reset properly
					// we can do that by checking if loooking at the 0th index of funders array throws an error
					await expect(fundMe.getFunder(0)).to.be.reverted

					// make sure the addressToAmountFunded mapping is reset properly, i.e. all the amounts to addresses are 0
					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})

				// only owner can withdraw
				it("Only allows the owner to withdraw", async function () {
					// get a couple of accounts
					const accounts = await ethers.getSigners()

					// take one account to test if only owner can withdraw
					const attacker = accounts[1] // 1th position, because deployer is already at 0th position
					const attackerConnectedContract = await fundMe.connect(
						attacker
					)

					await expect(
						attackerConnectedContract.withdraw()
					).to.be.revertedWith("FundMe__NotOwner") // tx should revert when attackerConnectContract calls withdraw() with error code
				})
			})
	  })
