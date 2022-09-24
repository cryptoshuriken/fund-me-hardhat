// script to fund the FundMe contract
const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
	const { deployer } = await getNamedAccounts()
	const fundMe = await ethers.getContract("FundMe", deployer)

	console.log("Funding Contract... ⏳")
	const transactionResponse = await fundMe.fund({
		value: ethers.utils.parseEther("0.3"),
	})
	await transactionResponse.wait(1)

	console.log("Funded! 💰")

	const contractBalance = await fundMe.provider.getBalance(fundMe.address)

	console.log(`Contract Balance: ${contractBalance}`)
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.log(e)
		process.exit(1)
	})
