const { network } = require("hardhat")
const {
	developmentChains,
	DECIMALS,
	INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	const chainId = network.config.chainId

	// only deploy to local development chains
	if (developmentChains.includes(network.name)) {
		// if the network name is in developmentChains
		log("Local network detected! Deploying mocks...🛠 ")
		await deploy("MockV3Aggregator", {
			contract: "MockV3Aggregator",
			from: deployer, // who is deploying it
			args: [DECIMALS, INITIAL_ANSWER],
			log: true,
		})
		log("Mocks Deployed! ✅")
		log("--------------------------------------------------")
	}
}

module.exports.tags = ["all", "mocks"]
