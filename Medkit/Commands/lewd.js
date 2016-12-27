const CommandSet = require('./CommandSet')
const Command = require('./Command')

////
// lood-level commands
class LewdCmd extends CommandSet {
	_register(as) {
		as(this.commands, 'lewd', {perms: 3})
	}

	_boot() {
		this.commands = [
			new Command({
				regex: /gelbooru (.*)/,
				usage: 'gelbooru <query>',
				help: "Looks up some stuff on gelbooru.",
				callback: (message, matches) => {
					let gelbooru = message.Medkit.Lewdkit.Apis.gelbooru

					gelbooru.query(matches[0]).then((data) => {
						message.reply(gelbooru.humanize(data))
					})

				},
				sources: ['text']
			}),
			new Command({
				regex: /rule34 (.*)/,
				usage: 'rule34 <query>',
				help: "Looks up some stuff on rule34.xxx.",
				callback: (message, matches) => {
					let rule34 = message.Medkit.Lewdkit.Apis.rule34xxx

					rule34.query(matches[0]).then((data) => {
						message.reply(rule34.humanize(data))
					})

				},
				sources: ['text']
			}),
		]
	}
}

module.exports = LewdCmd
