const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// Root-level commands
class BasicCmd extends CommandSet {
	_register(as) {
		as(this.commands, 'ps2', {perms: 3})
	}
	_boot() {
		this.commands = [
			new Command({
				regex: /server ([a-zA-Z]+)/,
				usage: 'server <server name>',
				help: 'Gives you a role based on your server of choice.',
				callback: (message, matches) => {
					matches[0] = matches[0].toLowerCase()

					if (message.SC.roles[`ps2:${matches[0]}`] !== undefined) {
						message.UC.GM.addRole(message.SC.roles[`ps2:${matches[0]}`])
					} else {
						message.reply("I dunno that server.\n*If you're from PS4, just use `PS4`.*")
					}
				},
				sources: ['text']
			})
		]
	}
}

module.exports = BasicCmd
