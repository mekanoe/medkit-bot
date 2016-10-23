class ServerContext {
	constructor(medkit, server, serverData = null) {
		this.Medkit = medkit

		this.S = server
		this.id = server.id

		this.roles = {}
		this.modules = []
		this.logChannel = ''

		if (serverData !== null) {
			this.attachData(serverData)
		}
	}

	attachData(data) {
		this.modules = data.modules
		this.roles = data.roles
		this.logChannel = data.logChannel
	}

	llc(text) {
		console.log(`LLC (${this.S.name} <${this.id}>):\n    ${text}`)

		if (this.logChannel === "") {
			return
		}

		this.Medkit.client.channels.get(this.logChannel).sendMessage(text)
	}

	userHasRole(UC, role) {
		if (this.roles[role] === undefined || UC.GM === null) {
			return false
		}

		return UC.GM.roles.has(this.roles[role])
	}
}

module.exports = ServerContext