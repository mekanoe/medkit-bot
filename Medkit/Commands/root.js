const moment = require('moment-timezone')
const sysinfo = require('systeminformation')
const prettyBytes = require('pretty-bytes')
const fs = require('fs')

const CommandSet = require('../CommandSet')
const Command = require('../Command')
const { NewSC, NewUC } = require('../ContextUtils')

/// ///////
// Root-level commands
class RootCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'root', {perms: 0})
  }
  _boot () {
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
        // deprecated as of 23 nov 17
        regex: /init server/,
        usage: 'init server',
        hidden: true,
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
        regex: /say (.*)/,
        usage: 'say <text>',
        help: 'This bot speaks.',
        silentAck: true,
        callback: (message, matches) => {
          message.reply(matches[0])
        }
      }),
      new Command({
        regex: /sayin ([0-9]+) (.*)/,
        usage: 'sayin <channel id> <text>',
        help: 'This bot speaks in another channel.',
        callback: (message, matches) => {
          const ch = this.medkit.client.channels.get(matches[0])
          ch.send(matches[1])

          message.reply(`**Message** sent to #${ch.name} in ${ch.guild.name} >>\n\n${matches[1]}`)
        }
      }),
      new Command({
        regex: /dmto ([0-9]+) (.*)/,
        usage: 'dmto <user id> <text>',
        help: 'This bot speaks to someone.',
        callback: (message, matches) => {
          this.medkit.client.users.get(matches[0]).send(matches[1])
          message.reply(`**DM** sent to <@${matches[0]}> >>\n\n${matches[1]}`)
        }
      }),
      new Command({
        regex: /glcset ?([0-9]+)?/,
        usage: 'glcset <text>',
        help: 'Sets the global log channel.',
        callback: (message, matches) => {
          let channelId = matches[0]
          if (matches[0] === '' || channelId === undefined) {
            // use current channel
            channelId = message.M.channel.id
          }

          console.log(channelId, message.M)

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
        regex: /set status (.*)/,
        usage: 'set status <status>',
        help: 'Sets my status.',
        callback: (message, matches) => {
          this.medkit.patchSettings({ status_game: matches[0] })
          this.medkit.setStatus(matches[0])
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /set avatar/,
        usage: 'set avatar',
        help: 'Sets my avatar to the attached image.',
        callback: (message, matches) => {
          setTimeout(async () => {
            try {
              let url = ''

              if (message.M.attachments.length > 0) {
                url = message.M.attachments.first().url
              } else if (message.M.embeds.length > 0) {
                url = message.M.embeds[0].url
              } else {
                throw new Error('no viable url')
              }

              await this.medkit.client.user.setAvatar(url)
            } catch (err) {
              message.reply(`The dress you gave me didn't fit ;-;`)
              console.error('set avatar failed', err)
              return
            }

            message.reply('I look prettier now!~')
          }, 1000)
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /recache/,
        usage: 'recache',
        help: 'Recaches command tree in case something awful happened.',
        hidden: true,
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
          setTimeout(() => { process.exit(0) }, 250)
        }
      }),
      new Command({
        regex: /get settings/,
        usage: 'get settings',
        sources: ['dm', 'text'],
        callback: (message) => {
          message.reply('```js\n' + JSON.stringify(this.medkit.__internal.settings, null, '  ') + '```')
        }
      }),
      new Command({
        regex: /debug cache (\bon|off\b)/,
        usage: 'debug cache on|off',
        hidden: true,
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
        hidden: true,
        help: 'Start/stop output profiling data.',
        callback: (message, matches) => {
          this.medkit.__internal.profiler = matches[0] === 'on'
          message.reply(`Profiler is now ${matches[0]}.`)
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /as ([0-9]+) (.*)/,
        usage: 'as <server id> <command>',
        help: 'Run the command as it would in another server',
        callback: async (message, matches) => {
          // console.log(matches[0], matches[1])
          try {
            const nSC = await NewSC(this.medkit, matches[0])
            const nUC = await NewUC(this.medkit, message.UC.id, nSC)
            message.M.content = matches[1]
            // console.log(message.M, nSC)
            this.medkit.Commands.handler(message.M, { SC: nSC, UC: nUC, replyChannel: message.M.channel })
          } catch (e) {
            console.error(`ERROR: ${e}\n${e.trace || e.stack}`)
          }
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /stats/,
        usage: 'stats',
        help: 'Lists some cool stats about the bot',
        callback: async (message, matches) => {
          const load = await sysinfo.currentLoad()
          const procMem = process.memoryUsage()
          const sysMem = await sysinfo.mem()
          const lines = [
            `📊📈 **Stats**`, '',
            `🔥 **Uptime:** ${moment(this.medkit.__internal.bootTime).fromNow()}`,
            `👩‍❤️‍👩 **Users Served:** ${this.medkit.client.guilds.reduce((acc, g) => {
              return acc + g.memberCount
            }, 0)}`,
            `🔰 **Servers:** ${this.medkit.client.guilds.array().length}`,
            '',
            `⚙️ **CPU Load:** *Avg* >> ${load.avgload}% || *Current* >> ${load.currentload.toFixed(2)}%`,
            `⚙️ **Memory Usage:** *Hu/Ht* >> ${prettyBytes(procMem.heapUsed)}/${prettyBytes(procMem.heapTotal)} || *Sys Free* >> ${prettyBytes(sysMem.free)}/${prettyBytes(sysMem.total)}`,
            `⚙️ **DB Size:** ${prettyBytes(fs.statSync(this.medkit.Data.__path).size)}`
          ]
          message.reply(lines.join('\n'))
        }
      }),
      new Command({
        regex: /commands as (\badmin|mod|user|1|2|3\b)/,
        usage: 'commands as admin|mod|user',
        help: 'Figure out commands for specific roles',
        callback: async (message, matches) => {
          let userLevel = 0

          switch (matches[0]) {
            case '1':
            case 'admin':
              userLevel = 1
              break
            case '2':
            case 'mod':
              userLevel = 2
              break
            case '3':
            case 'user':
              userLevel = 3
              break
          }

          message.UC.permissions = userLevel
          message.UC.__forceRole = true

          try {
            message.M.content = '*commands'
            console.log(message.M)
            await this.medkit.Commands.handler(message.M, { UC: message.UC })
          } catch (e) {
            console.error(`ERROR: ${e}\n${e.trace || e.stack}`)
            throw e
          }
        },
        sources: ['dm', 'text']
      })
    ]
  }
}

module.exports = RootCmd
