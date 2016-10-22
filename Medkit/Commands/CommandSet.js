class CommandSet {
	constructor(medkit) {
		this.medkit = medkit
		this._boot()
		this._register(this._registerCallback.bind(this))
	}

	_registerCallback(commandSet, moduleName, {perms}) {

	}

	_boot() {}
	_register(as) {}
}

module.exports = CommandSet