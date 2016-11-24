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
				regex: /init server/,
				usage: 'init server',
				help: 'Initializes this server in the DB. (This also resets the data.)',
				callback: (message) => {
					this.medkit.Data.initServer(message.SC).then(() => {
						message.reply('Server is initialized. You can do further setup now!')
					})
				},
				sources: ['text']
			}),
			new Command({
				regex: /add module ([a-z0-9]+)/,
				usage: 'add module',
				help: 'Adds a service module to the medkit.',
				callback: (message, matches) => {
					message.SC.addModule(matches[0])
					.then(this.medkit.Commands.cache())
					.then(() => {
						message.reply(`Module ${matches[0]} added! Check the new stuff with \`*commands\`!`)
					})
				},
				sources: ['text']
			}),
			new Command({
				regex: /rm module ([a-z]+)/,
				usage: 'rm module',
				help: 'Adds a service module to the medkit.',
				callback: (message, matches) => {
					message.SC.rmModule(matches[0]).then(() => {
						message.reply(`Module ${matches[0]} removed.`)
					})
				},
				sources: ['text']
			}),
			new Command({
				regex: /get modules/,
				usage: 'get modules',
				help: 'Gets the service modules for this server.',
				callback: (message) => {
					message.reply(`Enabled modules for this server: ${message.SC.modules.join(', ')}`)
				},
				sources: ['text']
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
				regex: /glcset ?([0-9]+)?/,
				usage: 'glcset <text>',
				help: 'Sets the global log channel.',
				callback: (message, matches) => {
					let channelId = matches[0]
					if (matches[0] === '') {
						//use current channel
						channelId = message.M.channel.id
					}

					this.medkit.patchSettings({globalLogChannel: channelId}).then(() => {
						message.reply(`Global log channel is now set to ${channelId}`)
						this.medkit.glc('My global log channel is set to this channel.')
					})

				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /set username (.*)/,
				usage: 'set username <username>',
				help: 'Sets my username.',
				callback: (message, matches) => {
					this.medkit.client.user.setUsername(matches[0])
				},
				sources: ['dm', 'text']
			}),
			new Command({
				regex: /recache/,
				usage: 'recache',
				help: '**DANGER:** Recaches command tree. This is expensive.',
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
				regex: /stop the world/,
				usage: 'stop the world',
				help: 'Stops me. I might restart after, though.',
				sources: ['dm', 'text'],
				callback: (message) => {
					message.reply('Stopping. Bye.')
					setTimeout(() => {process.exit(0)}, 250)
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