module.exports = {
	getUsers: (req, res) => {
		res.render("users/index", {
			users: ["John Doe", "Jame Smith", "Mike Myers", "James Thomas"],
		})
	},
}
