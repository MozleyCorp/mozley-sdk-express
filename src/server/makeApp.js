"use strict"

const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const csurf = require("csurf")

const { isCelebrateError } = require("celebrate")

const sdk = require("../sdk")

let runningApp = null

// TODO: Add easy csrf for sites

/**
 * @param Settings {
 * 	environment: "development|production"
 * 	clientId: "client id for mozley network",
 * 	clientSecret: "client secret for mozley network",
 * 	frontendOrigin: "the domain your frontend is on (for CORS)",
 * 	authRedirect: "where users will be sent to once authenticated (must be approved redirect_uri)",
 * 	cookieSecret: "secret your cookies will be signed with"
 * 	style: "api" | "site"
 * }
 */
module.exports = (settings) => {
	const app = express()
	runningApp = app
	module.exports.app = app

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
	app.isApi = settings.style == "api"
	app.isSite = settings.style == "site"

	if (!app.isApi && !app.isSite) {
		throw new Error("Your app needs to either be an API or site")
	}

	app.xsrf = csurf({
		cookie: true,
		key: "XSRF-TOKEN",
		signed: true,
		secure: true,
		httpOnly: true,
		sameSite: "lax",
	})

	// Health check endpoints
	if (app.isApi) {
		const healthCheck = (_, res) => res.status(200).send("OK").end()
		app.get("/status", healthCheck)
		app.head("/status", healthCheck)
	}

	app.get("/%manifest", (req, res) =>
		res.json({
			appName: "",
			appOwner: "",
			appStyle: app.isApi ? "api" : "site",

			clientProvider: "",
			clientId: app.mzlysdk_options.clientId,
			clientRedirect: app.mzlysdk_options.authRedirect,
		})
	)

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
	if (app.isApi) {
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
			} else if (err.code == "EBADCSRFTOKEN") {
				res.status(403)
				res.json({
					errors: [
						{
							code: 0,
							message: "CSRF verification failed",
							userFacingMessage:
								"Something went wrong. Try refreshing the page or trying again later.",
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
			}
		})
	}

	return app
}

module.exports.app = () => runningApp
