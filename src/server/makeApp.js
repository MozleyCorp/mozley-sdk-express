"use strict"

const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")

const { Container } = require("typedi")
const { isCelebrateError } = require("celebrate")

const sdk = require("../sdk")

/**
 * @param Settings {
 * 	environment: "development|production"
 * 	clientId: "client id for mozley network",
 * 	clientSecret: "client secret for mozley network",
 * 	frontendOrigin: "the domain your frontend is on (for CORS)",
 * 	authRedirect: "where users will be sent to once authenticated (must be approved redirect_uri)",
 * 	cookieSecret: "secret your cookies will be signed with"
 * }
 */
module.exports = (settings) => {
	const app = express()
	Container.set("mzlyxpress", app)

	app.set("env", settings.environment)
	// Trust the proxy if we're in production, since we use a proxy in production
	app.set("trust proxy", settings.environment == "production")
	// Prevents possible security issues
	app.set("x-powered-by", false)

	app.mzlysdk_options = {
		clientId: settings.clientId,
		clientSecret: settings.clientSecret,
		frontendOrigin: settings.frontendOrigin,
		authRedirect: settings.onAuthenticatedRedirect,
	}

	// Health check endpoints
	const healthCheck = (_, res) => res.status(200).send("OK").end()
	app.get("/status", healthCheck)
	app.head("/status", healthCheck)

	// TODO: Swagger
	app.use(bodyParser.json())
	app.use(cookieParser(settings.cookieSecret || "keyboard cat", {}))
	/// app.use("/docs", ...)
	sdk(app)
	app.use(morgan("dev"))

	for (let middleware of settings.customMiddleware || []) {
		app.use(middleware)
	}

	if (typeof settings.loadRoutes == "function") {
		settings.loadRoutes(app)
	}

	// Pass 404 to error handler
	app.use((req, res, next) => {
		const err = new Error("Not Found")
		err.statusCode = 404
		next(err)
	})

	// Error handler (must be last app.use)
	app.use((err, req, res, next) => {
		if (isCelebrateError(err)) {
			let obj = {}
			err.details.forEach((value, key) => {
				obj[key] = value
			})

			res.status(err.status || 400)
			res.json({
				errors: [
					{
						code: -1,
						message: "Bad Request",
						details: obj,
						userFacingMessage: "Something went wrong",
					},
				],
			})
		} else {
			res.status(err.status || 500)
			res.json({
				errors: [
					{
						code: err.code || 0,
						message: err.message || "Internal Server Error",
						userFacingMessage: err.userFacingMessage || "Something went wrong",
					},
				],
			})

			if (process.env.NODE_ENV == "development") {
				throw err
			} else {
				Logger.error(`🔥 Error: ${err.message}`)
			}
		}
	})

	return app
}