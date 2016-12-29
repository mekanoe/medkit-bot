// http://www.pornhub.com/webmasters/search?id=44bc40f3bc04f65b7a35&thumbsize=medium_hd&search=
const superagent = require('superagent')

class Pornhub {
	constructor(medkit) {
		this.limit = 25
		this.generateRandom = medkit.generateRandom.bind(medkit, this.limit)
		this.url = 'http://www.pornhub.com/webmasters/search?id=44bc40f3bc04f65b7a35&thumbsize=large_hd&search='
	}

	command(name) {
		return {
			regex: new RegExp(`${name} (.*)`),
			usage: `${name} <query>`,
			help: `Looks up some stuff on ${name}.`,
			callback: (message, matches) => {
				let c = message.Medkit.Lewdkit.Apis[name]

				c.query(matches[0]).then((data) => {
					message.reply(c.humanize(data))
				})

			},
			sources: ['text']
		}
	}

	query(search) {
		return new Promise((resolve, reject) => {
			superagent.get(this.url+search).type('json').then((res) => {
				resolve(res.body.videos[this.generateRandom()])
			})
		})
	}

	humanize(item) {
		return `:link: **Video URL: <${item.url}>**\n:asterisk: ${item.title}\n:frame_photo: ${item.thumb}`
	}
}

module.exports = Pornhub