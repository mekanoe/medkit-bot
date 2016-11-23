
const ROLE_ROOT = 0
const ROLE_ADMIN = 1
const ROLE_MOD = 2
const ROLE_USER = 3

class UserContext {
	constructor(medkit, user, SC = null) {
		this.Medkit = medkit
		this.U = user
		this.id = user.id
		this.permissions = ROLE_USER

		this.SC = null
		this.GM = null

		if (SC !== null) {
			this.attachSC(SC)
		} 

		this._resolvePerms()
	}

	_resolvePerms() {
		if (this.isRoot()) {
			this.permissions = ROLE_ROOT
			return
		}

		if (this.hasRole('admin')) {
			this.permissions = ROLE_ADMIN
			return
		}

		if(this.hasRole('mod')) {
			this.permissions = ROLE_MOD
			return
		}
	}

	hasRole(role) {
		if (this.SC === null) {
			return false
		}

		return this.SC.userHasRole({GM: this.GM}, role)
	}

	isRoot() {
		return this.Medkit.isRoot(this.U.id)
	}

	attachSC(SC) {
		this.SC = SC
		this.GM = SC.S.members.get(this.U.id)
		this._resolvePerms()
	}


}

module.exports = UserContext