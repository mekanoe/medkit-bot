const CommandSet = require('./CommandSet')
const Command = require('./Command')
const { NewSC, NewUC } = require('../ContextUtils')
const moment = require('moment')
const parseDuration = require('parse-duration')

class TimeoutController {
	constructor(medkit) {
		this.Medkit = medkit
		setInterval(() => { this.processTimeouts() }, 5000)
	}

	addTimeout({SC, UC, user_id, duration, reason}) {
		return new Promise((resolve, reject) => {
			let date = new Date()
			let len = parseDuration(duration)
			let now = date.getTime()
			let then = now + len

			this.Medkit.Data.db.run(
				"INSERT INTO timeouts (server_id, user_id, mod_user_id, start_time, end_time, duration, reason) VALUES (?, ?, ?, ?, ?, ?, ?)",
				SC.id,
				user_id,
				UC.id,
				now,
				then,
				len,
				reason,
				(err) => {
					UC.GM.addRole(SC.roles.timeout)

					if (err !== null) return reject(err)
					resolve(true) 
				}
			)
		})
	}

	processTimeouts() {
		this.Medkit.Data.db.all("SELECT * FROM timeouts WHERE end_time <= ?", Date.now(), (err, rows) => {
			let scCache = {}

			rows.forEach((rows) => {
				if (scCache[rows.server_id] !== undefined) {
					this.removeTimeout({SC: scCache[rows.server_id], user_id: rows.user_id})
				} else {
					NewSC(this.Medkit, rows.server_id).then((SC) => {
						scCache[SC.id] = SC
						this.removeTimeout({SC, user_id: rows.user_id})
					})
				}
			})
		})
	}

	removeTimeout({SC, user_id, mod_id = null}) {
		return new Promise((resolve, reject) => {
			this.Medkit.Data.db.run(
				"DELETE FROM timeouts WHERE user_id = ? AND server_id = ?",
				user_id,
				SC.id,
				(err) => {
					if (err !== null) return reject(err)
					

					
					NewUC(this.Medkit, user_id, SC).then((UC) => {
						UC.GM.removeRole(SC.roles.timeout)
						
						let extra = ""

						if (mod_id !== null) {
							extra = `This was reversed by <@${mod_id}>.`
						}

						SC.llc(`<@${user_id}> is no longer timed out. ${extra}`)
						resolve(true)
					})
				}
			)

		})
	}
}

let TC

class TimeoutCmd extends CommandSet {
	_register(as) {
		as(this.commands, 'timeouts', {perms: 2})
		TC = new TimeoutController(this.medkit)
	}
	_boot() {
		this.commands = [
			new Command({
				regex: /timeout <?@?!?([0-9]+)>? ([0-9]+[a-zA-Z]?) ?(.*)?/,
				usage: 'timeout <mention> <time>',
				help: 'Times-out a user for X time.\nTime is either in seconds or accepts a human "1d" or "30m" style too. Minimum is 15s.',
				callback: (message, matches) => {
					if (!/[a-zA-Z]$/.test(matches[1])) {
						matches[1] = matches[1]+'s'
					}

					let duration = parseDuration(matches[1])
					let durationHuman = moment.duration(duration).humanize()

					if (Math.floor(duration/1000) < 15) {
						message.reply("Timeout duration is too short. Minimum is 15s.")
						return
					}

					let user = message.M.mentions.users.first()

					TC.addTimeout({
						SC: message.SC,
						UC: message.UC,
						user_id: user.id,
						duration: matches[1],
						reason: matches[2]
					}).then(() => {
						message.reply(`<@${user.id}> was timed out for ${durationHuman}.`)
						message.SC.llc(`**TIMEOUT:**\n- Moderator: <@${message.UC.U.id}>\n- User: <@${user.id}>\n- Duration: ${durationHuman} (${Math.floor(duration/1000)} seconds)\n- Reason: ${matches[2]}`)
					})
				},
				sources: ['text']
			}),
			new Command({
				regex: /untimeout <@!([0-9]+)>/,
				usage: 'untimeout <mention>',
				help: 'Reverses a timeout.',
				callback: (message, matches) => {
					TC.removeTimeout({SC: message.SC, user_id: matches[0], mod_id: message.UC.id}).then(() => {
						message.reply(`<@${matches[0]}>'s timeout has been lifted.`)
					})
				},
				sources: ['text']
			})
		]
	}
}

module.exports = TimeoutCmd