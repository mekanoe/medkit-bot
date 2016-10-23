const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// Root-level commands
class RootCmd extends CommandSet {
	_boot() {
		this.commands = [
			new Command({
				regex: /joinurl/,
				callback: (message) => {
					message.channel.sendMessage(`https://discordapp.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot`)
				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /glcsay (.*)/,
				callback: (message, matches) => {
					this.medkit.glc(matches[0])
				},
				sources: ['dm', 'text']
			})
		]
		
	}

	_register(as) {
		as(this.commands, 'root', {perms: 0})
	}

}