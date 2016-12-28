const apiList = [
	// 2d
	'gelbooru',
	'rule34xxx',
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

}

module.exports = Lewdkit