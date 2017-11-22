const CommandSet = require('./CommandSet')
const Command = require('./Command')

/// /
// lood-level commands
class LewdCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'lewd', {perms: 3})
  }

  _boot () {
    this.commands = this.medkit.Lewdkit.apisToCommandArray()
  }
}

module.exports = LewdCmd
