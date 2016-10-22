class Commands {
	constructor(medkit) {
		this.medkit = medkit
		
	}

	register() {

	}

	////
	// @event
	// Handles a Discord->message
	handler(message) {
		if (message.author.bot) return
	}
}

module.exports = Commands