// 1 - imports
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// 2 - module export with async anon function
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	const chainId = network.config.chainId

	let ethUsdPriceFeedAddress

	if (developmentChains.includes(network.name)) {
		// if we're on a dev chain, get the recent contractdeployment of MockV3Aggregator
		// and then pass in the deployment address to get ethUsdPriceAddress
		const ethUsdAggregator = await deployments.get("MockV3Aggregator") // get() gets the most recent deployment of a contract
		ethUsdPriceFeedAddress = ethUsdAggregator.address
	} else {
		// if we're on a test net or mainnet
		// get the address from helper-hardhat-config by passing in the chainId of respective network
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
	}

	const args = [ethUsdPriceFeedAddress]

	const fundMe = await deploy(/*contract name*/ "FundMe", {
		from: deployer, // who is deploying it
		args: args, // args to the constructor function
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1, // wait for these many blockcomfirmations (specified in hardhat.config.js) or 1,
	})

	// verify contract on etherscan if contract is not deployed on developmentChains
	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, args)
	}

	log("✨----------------------------------------------✨")
}

module.exports.tags = ["all", "fundme"]
