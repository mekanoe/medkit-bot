const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// Root-level commands
class AdminCmd extends CommandSet {
	_boot() {
		this.commands = [
			new Command({
				regex: /joinurl/,
				callback: (message) => {
					message.channel.sendMessage(`https://discordapp.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot`)
				}
			}),

		]
		
	}

	_register(as) {
		as(commands, 'admin', {perms: 0})
	}

}