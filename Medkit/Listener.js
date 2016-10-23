class Listener {
	constructor(medkit) {
		this.medkit = medkit
		this.Client = this.medkit.client

		this.Client.on('ready', medkit.readyScript.bind(medkit))
		this.Client.on('message', medkit.Commands.handler.bind(medkit.Commands))
	}
}

module.exports = Listener