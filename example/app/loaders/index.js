"use strict"

const express = require("./express")

module.exports = async () => {
	const app = await express()

	return app
}
