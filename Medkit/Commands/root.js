const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// Root-level commands
class RootCmd extends CommandSet {
	_register(as) {
		as(this.commands, 'root', {perms: 0})
	}
	_boot() {
		this.commands = [
			new Command({
				regex: /joinurl/,
				usage: 'joinurl',
				help: 'Gets the OAuth2 join URL for this bot.',
				callback: (message) => {
					message.reply(`https://discordapp.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot`)
				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /glcsay (.*)/,
				usage: 'glcsay <text>',
				help: 'Sends a message to the global log channel.',
				callback: (message, matches) => {
					this.medkit.glc(matches[0])
				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /recache/,
				usage: 'recache',
				help: 'DANGER: Recaches command tree. This is expensive.',
				sources: ['dm', 'text'],
				callback: (message) => {
					let start = new Date()
					this.medkit.glc(`Command triggered recache`)
					this.medkit.Commands.cache().then(() => {
						this.medkit.glc(`Recache done after ${new Date() - start}ms`)
						message.reply(`Recache done.`)
					})
				}
			}),
			new Command({
				regex: /debug cache (\bon|off\b)/,
				usage: 'debug cache on|off',
				help: 'Turns on/off the command tree cache.',
				callback: (message, matches) => {
					this.medkit.__internal.noCache = matches[0] === 'off'
					message.reply(`Cache is now ${matches[0]}.`)
				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /debug profiler (\bon|off\b)/,
				usage: 'debug profiler on|off',
				help: 'Start/stop output profiling data.',
				callback: (message, matches) => {
					this.medkit.__internal.profiler = matches[0] === 'on'
					message.reply(`Profiler is now ${matches[0]}.`)
				},
				sources: ['dm', 'text']
			})
		]
		
	}

}

module.exports = RootCmd