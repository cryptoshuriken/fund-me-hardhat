// import run command from hardhat
const { run } = require("hardhat")

// programmatically verify contract
async function verify(contractAddress, args) {
	console.log("Verifying Contract...✨🤔")

	try {
		await run("verify:verify", {
			address: contractAddress,
			constructorArguments: args,
		})
	} catch (e) {
		if (e.message.toLowerCase().includes("already verified")) {
			console.log("Already verified!")
		} else {
			console.log(e)
		}
	}
}

// export
module.exports = { verify }
