const discord = require('discord.js')
const winston = require('winston')
const { Set } = require('immutable')

class Medkit {
	constructor() {
		// mount data
		this.Data = new (require('./Data'))(this)
		this.Data.recache({sync: true})

		// setup internal data
		this.__internal = {}
		this.__internal.rootUsers = this.getRootUsers()

		// get discord client, mount working stuff
		this.client = new discord.Client()

		this.Commands = new (require('./Commands'))(this)
		this.Listener = new (require('./Listener'))(this)

		// discord login
		this.client.login(process.env.DISCORD_TOKEN)

		this.Data.commit().then(() => {
			console.log('config committed')
		}).catch((err) => {
			console.log('config commit failed', err)
		})
	}

	////
	// Send a message to the global log channel
	//
	// Arguments:
	// - text str{}
	glc(text) {
		console.log(`GLC:\n    ${text}`)


		let glcId = this.Data.P.get('globalLogChannel')
		if (glcId !== "") {
			this.client.channels.get(glcId).sendMessage(text)
		}
	}

	////
	// Send a message to the global log channel
	//
	// Arguments:
	// - text str{}
	llc(server, text) {
		let llcId = this.Data.P.get('servers').get(server).get('logChannel')
		if (llcId !== "") {
			this.client.channels.get(llcId).sendMessage(text)
		}
	}

	////
	// @event
	// Runs whatever's meant to run at Discord->ready
	readyScript() {
		console.info('Client is ready.')
		if (process.env.NODE_ENV === 'production') {
			this.glc(`Started at ${new Date()}`)
		}

		let status = this.Data.P.get('status').toJS()
		this.client.user.setStatus(status.state, status.game)
	}

	////
	// Memoizing root users getter.
	getRootUsers() {
		return this.__internal.rootUsers || Set((process.env.ROOT_USERS || "").split(','))
	}
}

module.exports = {
	// syntax sugar for starting
	boot: () => {
		return new Medkit()
	},

	Medkit
}