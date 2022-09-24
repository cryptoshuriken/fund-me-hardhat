const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
	const { deployer } = await getNamedAccounts()
	const fundMe = await ethers.getContract("FundMe", deployer)

	console.log("Withdrawing... ⏳")

	const transactionResponse = await fundMe.withdraw()
	await transactionResponse.wait(1)

	const endingContractBalance = await fundMe.provider.getBalance(
		fundMe.address
	)

	console.log("Withdrawal complete! 🤑")

	console.log(`Contract Balance: ${endingContractBalance}`)
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.log(e)
		process.exit(1)
	})
