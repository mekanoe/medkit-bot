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
			new Command({
				regex: /safebooru (.*)/,
				usage: 'safebooru <query>',
				help: "Looks up some stuff on safebooru.",
				callback: (message, matches) => {
					let safebooru = message.Medkit.Lewdkit.Apis.safebooru

					safebooru.query(matches[0]).then((data) => {
						message.reply(safebooru.humanize(data))
					})

				},
				sources: ['text']
			}),
			new Command({
				regex: /yandere (.*)/,
				usage: 'yandere <query>',
				help: "Looks up some stuff on yandere.",
				callback: (message, matches) => {
					let yandere = message.Medkit.Lewdkit.Apis.yandere

					yandere.query(matches[0]).then((data) => {
						message.reply(yandere.humanize(data))
					})

				},
				sources: ['text']
			}),
			new Command({
				regex: /pornhub (.*)/,
				usage: 'pornhub <query>',
				help: "Looks up some stuff on pornhub.",
				callback: (message, matches) => {
					let pornhub = message.Medkit.Lewdkit.Apis.pornhub

					pornhub.query(matches[0]).then((data) => {
						message.reply(pornhub.humanize(data))
					})

				},
				sources: ['text']
			}),
			new Command({
				regex: /\/r\/([a-z]+)/,
				usage: '/r/<subreddit>',
				help: "Looks up some stuff on a subreddit.",
				callback: (message, matches) => {
					let reddit = message.Medkit.Lewdkit.Apis.reddit

					reddit.query(matches[0]).then((data) => {
						message.reply(reddit.humanize(data))
					})

				},
				sources: ['text']
			}),
		]
	}
}

module.exports = LewdCmd
