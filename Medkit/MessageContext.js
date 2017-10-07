const UserContext = require('./UserContext')
const ServerContext = require('./ServerContext')

////
// Message context. Wraps a Discord#Message into more medkit-specific things.
class MessageContext {
	constructor(medkit, message, {UC = null, SC = null, replyChannel = null} = {}) {
		this.M = message
		this.Medkit = medkit

		this.text = message.content
		this.source = message.channel.type
		this.__replyChannel = replyChannel || message.channel

		this.UC = UC
		this.SC = SC
	}

	isDM() {
		return this.source === 'dm'
	}

	reply(text) {
		return this.__replyChannel.sendMessage(text)
	}

}

module.exports = MessageContext