const Danbooru = require('./danbooruclone')

class Gelbooru extends Danbooru {
	constructor(medkit) {
		super(medkit)
		this.domain = "https://yande.re"
	}
}

module.exports = Gelbooru