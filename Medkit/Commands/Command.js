class Command {
	constructor({regex, callback, sources = ['text']}) {
		this.regex = regex
		this.callback = callback
		this.sources = sources
	}

	match(text) {
		return text.match(this.regex)
	}

	run(msg) {
		callback(msg)
	}
}

module.exports = Command