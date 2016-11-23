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

	addModule(module) {
		this.modules.push(module)
		return new Promise((resolve, reject) => {
			this.Medkit.Data.db.run('UPDATE servers SET modules=$modules WHERE server_id = $serverId', {
				$serverId: this.id,
				$modules: this.modules.join(',')
			}, () => {
				resolve(true)
			})
		})
	}

	rmModule(module) {
		this.modules = this.modules.filter(m => m !== module)
		return new Promise((resolve, reject) => {
			this.Medkit.Data.db.run('UPDATE servers SET modules=$modules WHERE server_id = $serverId', {
				$serverId: this.id,
				$modules: this.modules.join(',')
			}, () => {
				resolve(true)
			})
		})
	}

	addRole(role, name) {
		return new Promise((resolve, reject) => {
			// get role id from name
			let gr = this.S.roles.find('name', name)
			if (gr === null) {
				return reject(new Error('role not found'))
			}

			this.Medkit.Data.db.run('INSERT OR REPLACE INTO servers_roles(server_id, role_spec, role_id) VALUES (?, ?, ?)', this.id, role, gr.id, (err) => {
				if (err !== null) return reject(err)
				resolve(true) 
			})

		})
	}

	setLogChannel(channel) {
		return new Promise((resolve, reject) => {

			this.Medkit.Data.db.run('UPDATE servers SET logChannel=? WHERE server_id=?', channel, this.id, (err) => {
				if (err !== null) return reject(err)
				resolve(true) 
			})

		})
	}

	// rmRole(role, name)

	userHasRole(UC, role) {
		if (this.roles[role] === undefined || UC.GM === null) {
			return false
		}
		return UC.GM.roles.exists('id', this.roles[role])
	}
}

module.exports = ServerContext