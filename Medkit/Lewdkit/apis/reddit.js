const superagent = require('superagent')

class Reddit {
	constructor(medkit) {
		this.limit = 50
		this.generateRandom = medkit.generateRandom.bind(medkit, this.limit)
	}

	query(subreddit) {
		return new Promise((resolve, reject) => {
			superagent.get(`https://reddit.com/r/${subreddit}/top.json?t=all&limit=${this.limit}`).type('json').then((res) => {
				resolve(res.body.data.children[this.generateRandom()])
			})
		})
	}

	humanize(item) {
		return `:link: ${item.data.url}`
	}
}

module.exports = Reddit