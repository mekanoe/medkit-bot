class Command {
	constructor({regex, callback}) {
		this.regex = regex
		this.callback = callback
	}

	match(text) {
		return text.match(this.regex)
	}

	run(msg) {
		callback(msg)
	}
}

module.exports = Command