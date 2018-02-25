/// /
// Message context. Wraps a Discord#Message into more medkit-specific things.
class MessageContext {
  constructor (medkit, message, {UC = null, SC = null, replyChannel = null} = {}) {
    this.M = message
    this.Medkit = medkit

    this.text = message.content
    this.source = message.channel.type
    this.__replyChannel = replyChannel || message.channel

    this.UC = UC
    this.SC = SC
  }

  isDM () {
    return this.source === 'dm'
  }

  reply (text, disableEveryone = true) {
    return this.__replyChannel.send(text, {
      split: true,
      disableEveryone
    })
  }
}

module.exports = MessageContext
