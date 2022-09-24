const networkConfig = {
	5: {
		name: "goerli",
		ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
	},
	137: {
		name: "polygon",
		ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
	},
}

const developmentChains = ["hardhat", "localhost"]

// Mock Contract constructor function parameters
const DECIMALS = 8 // how many decimal places
const INITIAL_ANSWER = 20000000000 // what is the initial price feed: 2000_00000000

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
