const dotenv = require("dotenv")

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development"

const envFound = dotenv.config()
if (envFound.error) {
	// This will crash the entire process
	throw new Error("⚠ Couldn't find .env file ⚠")
}

module.exports = {
	/**
	 * Your favourite port
	 * Alternate description: The port number this application will run on
	 */
	port: parseInt(process.env.PORT, 10),

	/**
	 * Client ID and Client Secret
	 * for Mozley Network
	 */
	client: {
		c_id: process.env.CLIENT_ID || "",
		c_secret: process.env.CLIENT_SECRET || "",
	},

	/**
	 * Used by the winston logger
	 */
	logs: {
		level: process.env.LOG_LEVEL || "silly",
	},
}
