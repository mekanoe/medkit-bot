const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// Root-level commands
class AdminCmd extends CommandSet {
	_register(as) {
		as(this.commands, 'admin', {perms: 1})
	}
	_boot() {
		this.commands = [
			new Command({
				regex: /add role ([a-z_-]+) (.+)/,
				usage: 'add role <type> <name>',
				help: 'Adds a role for use by anything.',
				callback: (message, matches) => {
					message.SC.addRole(matches[0], matches[1]).then(() => {
						message.reply(`Added role ${matches[1]} as ${matches[0]}`)
					}).catch((err) => {
						if (err.message === "role not found") {
							message.reply("I can't find that role.")
						} else {
							throw err
						}
					})
				},
				sources: ['text']
			})
		]
	}
}

module.exports = AdminCmd
