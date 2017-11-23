
const ROLE_ROOT = 0
const ROLE_ADMIN = 1
const ROLE_MOD = 2
const ROLE_USER = 3

class UserContext {
  constructor (medkit, user, SC = null) {
    this.Medkit = medkit
    this.U = user
    this.id = user.id
    this.permissions = ROLE_USER

    this.__forceRole = false

    this.SC = null
    this.GM = null

    if (SC !== null) {
      this.attachSC(SC)
    }

    this._resolvePerms()
  }

  _resolvePerms () {
    if (this.isRoot()) {
      this.permissions = ROLE_ROOT
      return
    }

    if (this.SC.S.ownerID === this.id) {
      this.permissions = ROLE_ADMIN
      return
    }

    if (this.hasRole('admin')) {
      this.permissions = ROLE_ADMIN
      return
    }

    if (this.hasRole('mod')) {
      this.permissions = ROLE_MOD
    }
  }

  humanRole () {
    switch (this.permissions) {
      case ROLE_USER: return 'user'
      case ROLE_MOD: return 'mod'
      case ROLE_ADMIN: return 'admin'
      case ROLE_ROOT: return 'root'
    }
  }

  hasRole (role) {
    if (this.SC === null) {
      return false
    }

    return this.SC.userHasRole({GM: this.GM}, role)
  }

  isRoot () {
    if (this.__forceRole === true) {
      return false
    }

    return this.Medkit.isRoot(this.U.id)
  }

  attachSC (SC) {
    this.SC = SC
    this.GM = SC.S.members.get(this.U.id)
    this._resolvePerms()
  }
}

module.exports = UserContext
