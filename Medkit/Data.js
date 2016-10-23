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

		if (process.env.FORCE_RESET === true) {
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
					outObj[v.role_spec] = role_id
				})
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

				server.modules = server.modules.split(',')

				this.getServerRoles(id).then((roles) => {
					server.roles = roles
					resolve(server)
				}).catch((err) => {
					reject(err)
				})

			})

		})
	}

}

module.exports = Data