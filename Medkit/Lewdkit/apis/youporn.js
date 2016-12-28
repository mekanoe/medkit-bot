const Pornhub = require('./pornhub')

class YouPorn extends Pornhub {
	constructor(medkit) {
		super(medkit)
		this.url = 'http://www.youporn.com/api/webmasters/search?thumbsize=large_hd&search='
	}
}

module.exports = YouPorn