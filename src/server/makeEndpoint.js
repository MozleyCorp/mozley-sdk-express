"use strict"

const assert = require("assert")
const async = require("async")

const cors = require("cors")
const { celebrate } = require("celebrate")

// Used for getting the express app (a.app())
const a = require("./makeApp")

const httpVerbs = [
	"all",
	"get",
	"head",
	"post",
	"put",
	"delete",
	"trace",
	"options",
	"connect",
	"patch",
]

const typeError = (msg) => new TypeError(msg)

// From: https://stackoverflow.com/a/16608045/13613988
const isArray = (a) => !!a && a.constructor === Array
const isObject = (a) => !!a && a.constructor == Object

// Modified from: https://stackoverflow.com/a/37681251/13613988
const middlewareArray = (middlewareList) => {
	return (req, res, next) => {
		async.eachSeries(
			middlewareList,
			function (middleware, callback) {
				middleware.bind(null, req, res, callback)()
			},
			next
		)
	}
}

/**
 * Creates an express route
 * @param {ExpressRouter} router The router this route will be created under
 * @param {String (HttpVerb)} method The HTTP Verb to use. See (HttpVerb) below.
 * @param {String} path The route for this endpoint. (e.g. /me), can include multiple slashes (e.g. /users/me)
 * @param {Object} settings See Settings section below
 * @param {Function(req, res, next)} handler The handler for this endpoint
 *
 * Settings: {
 * 	validator: Optional. See Validation section below.
 * 	cors: Optional Object|Null (uses default CORS settings if undefined, uses no CORS if null) See https://www.npmjs.com/package/cors#configuration-options
 * 	xsrfToken: Optional Boolean (default true; false if GET or OPTIONS). Determines if an X-XSRF-TOKEN header should be validated before request can continue.
 * 	requireAuthentication: Optional Boolean (default false). Request will be blocked if user is not authenticated.
 * 	middlewares: Optional Array
 * }
 *
 * Injected into (req, res):
 * 	> req.isAuthenticated() - Returns if the user is authenticated (lazy load)
 * 	> req.getUser() - Returns the authenticated user or null (lazy load)
 *
 * (HttpVerb): ALL, GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, CONNECT, or PATCH
 */
module.exports = (router, method, path, settings, handler) => {
	assert(router, typeError("Router must be specified"))
	assert(
		typeof method == "string" && httpVerbs.indexOf(method.toLowerCase()) >= 0,
		typeError("Method must be specified and must be a HTTP verb")
	)
	assert(typeof path == "string", typeError("Path must be specified"))
	assert(
		settings == undefined || isObject(settings),
		typeError("Settings must be undefined or an object")
	)
	assert(
		typeof handler == "function",
		typeError("Handler must be specified and must be a function")
	)
	if (!settings) settings = {}

	const xsrfVerificationEnabled =
		typeof settings.xsrfToken == "boolean"
			? settings.xsrfToken
			: method == "get" || method == "options"
			? false
			: true
	const corsEnabled = settings.cors == null ? false : true

	const middlewares = []

	if (corsEnabled) {
		// Use the default CORS settings
		middlewares.push(
			cors(
				settings.cors || {
					origin: [a.app().mzlysdk_options.frontendOrigin],
				}
			)
		)
	}

	if (xsrfVerificationEnabled) {
		middlewares.push(a.app().xsrf)
	}

	if (isObject(settings.validator)) {
		middlewares.push(celebrate(settings.validator))
	}

	if (isArray(settings.middlewares)) {
		for (let middleware of settings.middlewares) {
			middlewares.push(middleware)
		}
	}

	router[method](path, middlewareArray(middlewares), handler)
}
