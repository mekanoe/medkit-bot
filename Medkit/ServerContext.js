const { Map, List } = require('immutable')

class ServerContext {
	constructor(medkit, server) {
		this.Medkit = medkit

		this.S = server
		this.id = server.id

		this._d = medkit.Data.P.get('servers').get(this.id)

		this.modules = this._d.get('modules')
		this.roles = this._d.get('roles')
		this.logChannel = this._d.get('logChannel')
	}

	llc(text) {
		console.log(`LLC (${this.S.name} <${this.id}>):\n    ${text}`)

		if (this.logChannel === "") {
			return
		}

		this.Medkit.client.channels.get(this.logChannel).sendMessage(text)
	}
}