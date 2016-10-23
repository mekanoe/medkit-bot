
const ROLE_ROOT = 0
const ROLE_ADMIN = 1
const ROLE_MOD = 2
const ROLE_USER = 3

class UserContext {
	constructor(medkit, server, user) {

		this.SC = server
		this.U = user
		this.GM = server.S.member(user)
		this.Medkit = medkit

		this.permissions = ROLE_USER
		this._resolvePerms()
	}

	_resolvePerms() {
		if (this.Medkit.getRootUsers().has(this.U.id)) {
			this.permissions = ROLE_ROOT
		} else if(this.GM.roles.exists())
	}


}