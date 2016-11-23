const ServerContext = require('./ServerContext')
const UserContext = require('./UserContext')

////
// This file has a bunch of generic, out-of-context *Context wrappers.

module.exports = {

	NewSC: (medkit, id) => {
		return new Promise((resolve, reject) => {
			medkit.Data.getServer(id).then((s) => {
				let guild = medkit.client.guilds.get(id)
				resolve(new ServerContext(medkit, guild, s))
			})
		})
	},

	NewUC: (medkit, id, SC = null) => {
		return new Promise((resolve, reject) => {
			let user = medkit.client.users.get(id)
			resolve(new UserContext(medkit, user, SC))
		})
	}

}