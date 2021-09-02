
var { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login')

module.exports = {
	ensureLoggedIn: function () {
		return ensureLoggedIn('/api/404')
	},
	ensureLoggedOut: function () {
		return ensureLoggedOut('/api/404')
	}
}