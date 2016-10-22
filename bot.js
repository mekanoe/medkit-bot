// OLD BOT. HISTORICAL PURPOSES.

require('dotenv').config({silent: true})
const fs = require('fs')
const Discord = require('discord.js')
const Client = new Discord.Client()

Client.on('ready', msg => {
	console.log("I'm ready!")
	Client.user.setStatus('online', 'DM me `help`')
})

const DATA_PATH = process.env.DATA_PATH || process.cwd()
const ADMINS = (process.env.ADMINS || '').split(',')

function getState() {
	return new Promise((resolve, reject) => {
		fs.readFile(`${DATA_PATH}/data.json`, 'utf8', (err, d) => {
			if (err) {
				if (err.code === 'ENOENT') {
					return resolve({})
				} else {
					return reject(err)
				}
			}
			return resolve(JSON.parse(d))
		})
	})
}

function commitState(patch) {
	return new Promise((resolve, reject) => {
		getState().then((data) => {

			let serverId = Object.keys(patch)[0]
			let server = Object.assign({lewd: "", safe: "", logChannel: ""}, data[serverId] || {}, patch[serverId])

			let newData = Object.assign(data, {[serverId]: server})
			let atomic_time = Date.now()
			fs.writeFile(`${DATA_PATH}/data.json~${atomic_time}`, JSON.stringify(newData), 'utf8', (err) => {

				if (err) {
					throw err
				}

				fs.rename(`${DATA_PATH}/data.json~${atomic_time}`, `${DATA_PATH}/data.json`, (err) => {
					if (err) {
						throw err
					}

					resolve(true)
				})

			})
		})
	})
}


const adminCmds = {
	updateself: (msg) => {
		console.log('got updateself')
		process.exit(0)
	},

	// *addadult <user id>
	addadult: (msg) => {

	},

	'roles?': (msg) => {
		if (msg.channel.type !== 'text') {
			msg.channel.sendMessage("Ask on the server you're interested in, I have no idea here.")
			return
		}

		getState().then((d) => {
			if (msg.guild !== undefined && d[msg.guild.id] !== undefined) {
				let guildRoles = d[msg.guild.id]
				let guild = Client.guilds.get(msg.guild.id)

				let names = {
					lewd: (guildRoles.lewd === '') ? "*Unset*" : guild.roles.get(guildRoles.lewd).name,
					safe: (guildRoles.safe === '') ? "*Unset*" : guild.roles.get(guildRoles.safe).name
				}

				msg.channel.sendMessage(`I'm aware of\n - **🍆 lewd role:** ${names.lewd}\n - **🚸 safe role:** ${names.safe}`)
			} else {
				msg.channel.sendMessage("I'm uninitalized for this server.")
			}


		})
	},

	// *role lewd|safe <role name>
	role: (msg) => {
		let args = msg.content.split(' ').slice(1)

		if (args[0] !== 'lewd' && args[0] !== 'safe') {
			msg.channel.sendMessage(`What is a ${msg[0]}?`)
			return
		}

		let guild = msg.guild
		if (args.length === 3) {
			let guild = Client.guilds.get(args[2])
		}

		let roleName = args.slice(1).join(' ')

		let role = guild.roles.find('name', roleName)

		commitState({[guild.id]: {[args[0]]: role.id}}).then(() => {
			msg.channel.sendMessage(`${(args[0] === 'lewd') ? '🍆' : '🚸'} ${args[0]} role for ${guild.name} is ${role.name}.`)
		})
	},

	// *setlogchannel [<id>]
	setlogchannel: (msg) => {
		if (msg.guild === undefined) {
			msg.channel.sendMessage('I need a server!')
			return
		}

		let args = msg.content.split(' ').slice(1)

		let channel = msg.channel.id
		if (args.length === 1) {
			channel = args[0]
		}

		commitState({[msg.guild.id]: {"logChannel": channel}}).then(() => {
			msg.channel.sendMessage(`I'll start logging to ${(args.length === 1)?`channel id ${channel}`:msg.channel.name} for this server.`)
		})
	}
}

////
// Log channel thing
function logChannel(channelId, state, author) {
	if (channelId === "") return

	let channel = Client.channels.get(channelId)

	console.log(author)

	let msg = ""
	switch(state) {
		case "lewd":
			msg = `${author.author.username}#${author.author.discriminator} ${(author.gm.nickname !== null)?`(a.k.a. ${author.gm.nickname}) `:''}was given lewds.`
			break
		case "rejected":
			msg = `${author.author.username}#${author.author.discriminator} ${(author.gm.nickname !== null)?`(a.k.a. ${author.gm.nickname}) `:''}was caught with a fake I.D.`
			break
	}

	channel.sendMessage(msg)
}

////
// In DMs, I'm looking for "adult"
function handleDM(msg) {
	if (msg.content.toLowerCase() === "i am 18+ and willing to see adult content") {

		let author = msg.author
		console.log(`adulting ${author.username}`)
		getState().then(data => {
			let rejected = []

			Client.guilds.array().forEach((guild) => {
				console.log(`checking ${guild.name}`)
				let gm = guild.member(author)
				console.log(guild.name, gm)
				if (gm === undefined) {
					return
				}

				if (gm.roles.exists('id',data[guild.id].safe)) {
					rejected.push(guild.name)
					logChannel(data[guild.id].logChannel, 'rejected', {gm, author})
					console.log(`${guild.name} failed`)
					return
				}

				gm.addRole(data[guild.id].lewd)
				logChannel(data[guild.id].logChannel, 'lewd', {gm, author})
				console.log(`${guild.name} passed`)
			})

			msg.channel.sendMessage('Hello fellow adult!')
			if (rejected.length !== 0) {
				msg.channel.sendMessage(`You failed to pass adulthood in: ${rejected.join(', ')}`)
			}
		})

	} else if (msg.content.toLowerCase() === 'help') {

		msg.channel.sendMessage(`Hi ${msg.author.username}, I'm an adult friend finder.\n\nI can let you into NSFW channels if you tell me this exactly:\n**I am 18+ and willing to see adult content**`)

	}
}

////
// Admin can be done anywhere...
function handleAdmin(msg) {
	if (msg.content[0] !== "*") return handleMsg(msg)

	let command = msg.content.split(' ')[0].substr(1)

	if (adminCmds[command] !== undefined) {
		adminCmds[command](msg)
	}
}

function handleText(msg) {}

function handleMsg(msg) {
	if (msg.channel.type === 'dm') {
		handleDM(msg)
		return
	}

	if (msg.channel.type === 'text') {
		handleText(msg)
		return
	}
}


Client.on('message', msg => {
	if (msg.author.bot) return

	if (ADMINS.indexOf(msg.author.id) !== -1) {
		handleAdmin(msg)
		return
	}

	handleMsg(msg)

})

Client.login(process.env.DISCORD_TOKEN)