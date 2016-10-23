class CommandSet {
	constructor(medkit) {
		this.medkit = medkit
		this._boot()
		this._register(this._registerCallback.bind(this))
	}

	_registerCallback(commandSet, moduleName, opts) {
		commandSet.forEach((cmd) => {
			// console.log('commandset loop', cmd)
			cmd.module = moduleName
			this.medkit.Commands.register(cmd, moduleName, opts)
		})
	}

	_boot() {}
	_register(as) {}
}

module.exports = CommandSet