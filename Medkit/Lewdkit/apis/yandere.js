const Danbooru = require('./danbooruclone')

class Gelbooru extends Danbooru {
	constructor(medkit) {
		super(medkit)
		this.domain = "http://yande.re"
	}
}

module.exports = Gelbooru