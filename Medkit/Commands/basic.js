const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// Root-level commands
class BasicCmd extends CommandSet {
	_register(as) {
		as(this.commands, 'basic', {perms: 3})
	}
	_boot() {
		this.commands = [
			new Command({
				regex: /say (.*)/,
				usage: 'say <message>',
				help: 'Echos back a message.',
				callback: (message, matches) => {
					message.reply(matches[0])
				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /commands/,
				usage: 'commands',
				help: 'Shows available commands.',
				callback: (message) => {

					let cmds = this.medkit.Commands.resolver(message)

					let text = "Available commands:\n\n" + cmds.map(cmd => `  - \`${cmd.command.usage}\` \n    ${cmd.command.help}`).join('\n\n')
					message.reply(text)
				},
				sources: ['dm', 'text']
			})
		]
	}
}

module.exports = BasicCmd
