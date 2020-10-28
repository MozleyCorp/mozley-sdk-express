"use strict"

const mzly = require("../src")
const app = mzly.app({
	environment: "development",
	clientId: "",
	clientSecret: "",
	frontendOrigin: "*",
	onAuthenticatedRedirect: "",
	customMiddleware: [
		(req, res, next) => {
			req.userName = "John"
			next()
		},
	],

	loadRoutes: (app) => {
		mzly.endpoint(app, "get", "/", {}, (req, res) => {
			res.send(`Hi, ${req.userName}`)
		})
	},
})

app.listen(3000, () => {
	console.log("Listening on 3000")
})
