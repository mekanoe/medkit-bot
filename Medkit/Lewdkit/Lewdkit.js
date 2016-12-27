const apiList = [
	'gelbooru',
	'danbooru',
	'rule34xxx'
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