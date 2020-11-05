"use strict"

/**
 * @TODO move a lot of this to the SDK boilerplate
 * (aka have a 'site' and 'api' flag to toggle things)
 */

const express = require("express")
const path = require("path")
const mzly = require("@mozley/sdk-express")
const nunjucks = require("nunjucks")

const config = require("../config")
const routes = require("../routes")

// Adding app-wide middleware:
/// const { middlewareName } = require("../middlewares")
// you can then add it in 'customMiddleware' below

module.exports = async () => {
	const app = mzly.app({
		environment: process.env.NODE_ENV,
		clientId: config.client.c_id,
		clientSecret: config.client.c_secret,
		// ⚠ CHANGE THIS TO YOUR APP DOMAIN
		frontendOrigin: "example.com",
		// Change this to what should be your apps' redirect_url. Make sure you add
		// it as a redirect_url
		onAuthenticatedRequest: "https://example.com/dashboard",
		// You can add any additional app-wide middleware here
		customMiddleware: [express.static(path.join(__dirname, "..", "..", "public"))],
		loadRoutes: (app) => routes(app),
	})

	nunjucks.configure(path.join(__dirname, "..", "view"), {
		autoescape: true,
		express: app,
	})

	app.set("view engine", "njk")

	return app
}
