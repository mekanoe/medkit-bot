class Command {
	constructor({regex, callback, usage, module = "", help, sources = ['text']}) {
		this.regex = regex
		this.callback = callback
		this.sources = sources
		this.usage = usage || regex.source
		this.help = help

		this.module = module // this is usually set as part of the command 
							 // set instead of in the constructor.
	}

	match(text) {
		return text.match(this.regex)
	}

	run(ctx, msg, matches) {
		this.callback.call(ctx, msg, matches)
	}
}

module.exports = Command