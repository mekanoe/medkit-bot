////
// Message context. Wraps a Discord#Message into more medkit-specific things.
class MessageContext {
	constructor(medkit, message) {
		this.M = message
		this.Medkit = medkit

		this.text = message.content
		this.source = message.channel.type

		// User Context
		//this.UC =
		//this.SC = new ServerContext() 
	}

	isDM() {
		return this.source === 'dm'
	}


}