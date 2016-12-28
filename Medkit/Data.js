const fs = require('fs')
const sqlite3 = require('sqlite3')

// const initialEphemeral = Map({
// 	userEvents: Map(),
// })

// const initialPersistent = Map({
// 	schema: 2,
// 	servers: Map(),
// 	status: Map({
// 		state: 'online',
// 		game: "DM me `help`"
// 	}),
// 	globalLogChannel: process.env.GLOBAL_LOG_CHANNEL || "",
// 	adminPrefix: "*",
// })

// const initialObjects = {
// 	server: Map({
// 		modules: List(),
// 		prefix: "!",
// 		roles: Map({
// 			mute: "",
// 			nsfw: "",
// 			no_nsfw: "",
// 			moderator: "",
// 			admin: "",
// 		}),
// 		logChannel: ""
// 	}),
// }

const PATH = `${process.env.DATA_PATH || process.cwd()}/medkit-data.db3`

class Data {
	constructor(medkit) {
		this.medkit = medkit
		
		let needsMigration = false
		if (!fs.existsSync(PATH)) {
			needsMigration = true
		}

		if (process.env.FORCE_RESET === '1') {
			try {
				fs.unlinkSync(PATH)
				console.warn("deleted database")
			} catch(e) {

			}
			needsMigration = true
		}

		console.log('db path:', PATH)
		this.db = new sqlite3.cached.Database(PATH)

		if (needsMigration) {
			this.__migrate()
		}
	}

	__migrate() {
		console.warn("starting hot database migration")
		let sql = fs.readFileSync(`${__dirname}/../utils/dbsetup.sql`,'utf8')
		this.db.exec(sql, (err) => {
			console.log("migration done, output -> \n    ", err)
		})
	}

	getMedkitSettings() {
		return new Promise((resolve, reject) => {
			this.db.all("select * from settings", (err, rows) => {
				if (err) return reject(err)

				let outObj = {}

				rows.forEach((v) => {
					outObj[v.key] = v.value
				}) 

				resolve(outObj)
			})
		})
	}

	getFullServerModuleTree() {
		return new Promise((resolve, reject) => {

			this.db.all("select modules, server_id from servers", (err, rows) => {
				if (err) return reject(err)

				let outObj = {}

				rows.forEach((v) => {
					outObj[v.server_id] = v.modules.split(',')
				})

				resolve(outObj)
			})

		})
	}

	getServerRoles(id) {
		return new Promise((resolve, reject) => {

			this.db.all("select * from servers_roles where server_id = ?", id, (err, rows) => {
				if (err) return reject(err)

				let outObj = {}

				rows.forEach((v) => {
					outObj[v.role_spec] = v.role_id
				})

				resolve(outObj)
			})

		})
	}

	getServerCommands(id) {
		return new Promise((resolve, reject) => {
				
			this.db.all("select command, response from custom_commands where server_id = ?", id, (err, rows) => {
				if (err) return reject(err)

				let outObj = {}

				rows.forEach((v) => {
					outObj[v.command] = v.response
				})

				resolve(outObj)
			})

		})
	}

	getServer(id) {
		return new Promise((resolve, reject) => {

			this.db.get("select * from servers where server_id = ?", id, (err, server) => {
				if (err) return reject(err)


				if (server === undefined) {
					return resolve(null)
				}

				server.modules = server.modules.split(',').filter(x => x !== '')

				this.getServerRoles(id).then((roles) => {
					server.roles = roles
					this.getServerCommands(id).then((commands) => {
						server.customCommands = commands
						resolve(server)
					}).catch((err) => { reject(err) }) 
				}).catch((err) => {
					reject(err)
				})

			})

		})
	}

	initServer(SC) {
		return new Promise((resolve, reject) => {
			this.db.exec(
				`INSERT INTO servers (server_id, modules, logChannel) VALUES ('${SC.id}', '', '');`,
				(err) => {
					if (err !== null) return reject(err) 
					resolve(true)
				}
			)
		})
	}

}

module.exports = Data