const CommandSet = require('../CommandSet')
const Command = require('../Command')
const moment = require('moment-timezone')

/// /
// Root-level commands
class BasicCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'basic', {perms: 3})
  }
  _boot () {
    this.commands = [
      // new Command({
      //   regex: /say (.*)/,
      //   usage: 'say <message>',
      //   help: 'Echos back a message.',
      //   callback: (message, matches) => {
      //     message.reply(matches[0])
      //   },
      //   sources: ['dm', 'text']
      // }),
      new Command({
        regex: /uptime/,
        help: 'Checks my uptime.',
        callback: (message) => {
          message.reply(`🔥 **Uptime:** ${moment(this.medkit.__internal.bootTime).fromNow()}`)
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /whoami/,
        hidden: true,
        callback: (message) => {
          message.reply(`You are **${message.UC.humanRole()}**.`)
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /bot/,
        hidden: true,
        callback: (message) => {
          message.reply("Hi! I'm Medkit. I'm a utility bot that fits in your slot. Sponsored by Genudine Dynamics.\n\nAsk <@62601275618889728> for more info.\n*Also see https://github.com/genudine/medkit-bot*")
        },
        sources: ['dm', 'text']
      }),
      new Command({
        regex: /commands$/,
        usage: 'commands',
        help: 'Shows available commands.',
        callback: async (message) => {
          let cmds = this.medkit.Commands.resolver(message)

          let text = ':information_desk_person: **Available commands:**\n\n' + cmds.filter(cmd => !cmd.command.hidden).filter(cmd => !(cmd.command.nsfw && !message.M.channel.nsfw)).map(cmd => `  - \`*${cmd.command.usage}\` \n    ${cmd.command.help}`).join('\n\n')

          if (!message.isDM() && message.SC.hasModule('commands')) {
            text = text + `\n\n**This server also has custom commands,** type \`-commands\` for these.`
          }

          message.reply(text)
        },
        sources: ['dm', 'text']
      })
    ]
  }
}

module.exports = BasicCmd
