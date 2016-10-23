class Commands {
	constructor(medkit) {
		this.medkit = medkit
		this.defaultModules = ['root', 'admin']
	}

	register() {

	}

	////
	// @event
	// Handles a Discord->message
	handler(message) {
		if (message.author.bot) {
			return
		}


	}
}

module.exports = Commands