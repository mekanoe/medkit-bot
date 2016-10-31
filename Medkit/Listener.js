class Listener {
	constructor(medkit) {
		this.medkit = medkit
		this.Client = this.medkit.client

		let alreadyReady = false

		this.Client.on('ready', () => {
			if (alreadyReady) {
				medkit.glc('Discord client sent ready and I was already ready.')
				return
			}

			alreadyReady = true
			medkit.readyScript.call(medkit)
		})
		this.Client.on('message', medkit.Commands.handler.bind(medkit.Commands))
	}
}

module.exports = Listener