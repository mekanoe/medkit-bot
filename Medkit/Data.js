const fs = require('fs')
const { fromJS, Map, List } = require('immutable')

const initialEphemeral = Map({
	userEvents: Map(),
})

const initialPersistent = Map({
	schema: 2,
	servers: Map(),
	status: Map({
		state: 'online',
		game: "DM me `help`"
	}),
	globalLogChannel: process.env.GLOBAL_LOG_CHANNEL || "",
	adminPrefix: "*",
})

const initialObjects = {
	server: Map({
		modules: List(),
		prefix: "!",
		roles: Map({
			mute: "",
			nsfw: "",
			no_nsfw: "",
			moderator: "",
			admin: "",
		}),
		logChannel: ""
	}),
}

const PATH = `${process.env.DATA_PATH || process.cwd()}/medkit-data.json`

////
// Data is a JSON file helper. This is intended to be wrapped in a Server or Medkit
// instance for simplicity because this is by no means simple.
class Data {
	constructor(medkit) {
		this.medkit = medkit
		this.P = initialPersistent
		this.E = initialEphemeral
	}

	////
	// Public dumb method for downstream syncing the persistent data.
	// This will return either null if you pick sync or a Promise<bool> for async.
	// Defaults to async.
	// 
	// Arguments:
	// obj{ sync bool{false} }
	recache({sync = false}) {
		return sync ? this._syncRecache() : this._asyncRecache() 
	}


	////
	// @private
	// Async read persistent data.
	_asyncRecache() {
		return new Promise((resolve, reject) => {
			fs.readFile(PATH, 'utf8', (err, data) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve(true)
					} else {
						return reject(err)
					}
				}

				this.updateFromJS(JSON.parse(data))

				return resolve(true)
			})
		})
	}

	////
	// @private
	// Sync read persistent data.
	_syncRecache() {
		let data = {}
		try {
			data = JSON.parse(fs.readFileSync(PATH, 'utf8'))
		} catch(err) {
			console.log(err)
			this.medkit.logger.error(err)
			if (err.code === 'ENOENT') return
		}

		this.updateFromJS(data)

		return
	}


	////
	// @internal
	// Updates the persistent set with a regular JS object.
	//
	// Arguments:
	// - data obj{}
	updateFromJS(data) {
		this.P = fromJS(data)
	}

	////
	// @internal
	// Updates the persistent set with an Immutable#Map
	//
	// Arguments:
	// - data Immutable#Map{}
	update(data) {
		this.P = data.clone()
	}


	////
	// @internal
	// Commits persistent data to disk.
	commit() {
		let self = this
		return new Promise((resolve, reject) => {
			let atomic_time = Date.now()
			fs.writeFile(`${PATH}~${atomic_time}`, JSON.stringify(self.P.toObject()), 'utf8', (err) => {
				if (err) {
					this.medkit.logger.error(err)
					reject(err)
				}

				fs.rename(`${PATH}~${atomic_time}`, PATH, (err) => {
					if (err) {
						this.medkit.logger.error(err)
						reject(err)
					}

					resolve(true)
				})
			})
		})
	}
}

module.exports = Data