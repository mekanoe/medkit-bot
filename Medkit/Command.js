class Command {
  constructor ({regex, callback, usage, hidden = false, silentAck = false, module = '', help, sources = ['text']}) {
    this.regex = new RegExp(`^\\*?${regex.source}`, regex.flags)
    this.callback = callback
    this.sources = sources
    this.usage = usage || regex.source
    this.help = help
    this.hidden = hidden
    this.silentAck = silentAck

    this.module = module // this is usually set as part of the command
               // set instead of in the constructor.
  }

  match (text) {
    return text.match(this.regex)
  }

  async run (ctx, msg, matches) {
    let returnVal = await this.callback.call(ctx, msg, matches)
    if (this.silentAck && returnVal !== false) {
      msg.M.delete()
    }
  }
}

module.exports = Command
