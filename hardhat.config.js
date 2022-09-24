require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const GOERLI_RPC_URL = process.env.GOERLI_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP = process.env.COINMARKETCAP
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
	// solidity: "0.8.8",
	solidity: {
		compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
	},
	defaultNetwork: "hardhat",
	networks: {
		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 5,
			blockConfirmations: 6,
		},
	},
	gasReporter: {
		enabled: true,
		outputFile: "gas-reporter.txt",
		currency: "USD",
		noColors: true,
		coinmarketcap: COINMARKETCAP,
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0, // by default the 0th account will be the deployer
		},
		user: {
			default: 1,
		},
	},
}
