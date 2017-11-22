const Command = require('../Commands/Command')

const apiList = [
	// 2d
	'gelbooru',
	'rule34',
	'yandere',
	'safebooru',

	// 3d
	'pornhub',
	'youporn',

	// etc
	'reddit',
]

class Lewdkit {
	constructor(medkit) {
		this.Medkit = medkit
		this.Data = medkit.Data

		this.Apis = {}
		this.mountApis(apiList)
	}

	mountApis(list) {
		list.forEach((v) => {
			this.Apis[v] = new (require('./apis/'+v))(this.Medkit)
		})
	}

	apisToCommandArray() {
		let commands = []
		return Object.keys(this.Apis).map((k) => {
			let v = this.Apis[k]
			if (v.command !== undefined) {
				const cmd = new Command(v.command(k))

				cmd.callback = this.wrapCallback(cmd.callback)

				return cmd
			}
		})

	}

	wrapCallback(cb) {
		return (message, matches) => {
			if (message.M.channel.nsfw) {
				cb(message, matches)
			}
		}
	}

}

module.exports = Lewdkit