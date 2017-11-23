const CommandSet = require('../CommandSet')
const Command = require('../Command')

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
        callback: (message) => {
          let cmds = this.medkit.Commands.resolver(message)

          let text = ':information_desk_person: **Available commands:**\n\n' + cmds.filter(cmd => !cmd.command.hidden).map(cmd => `  - \`*${cmd.command.usage}\` \n    ${cmd.command.help}`).join('\n\n')

          if (!message.isDM() && message.SC.hasModule('commands')) {
            text = text + `\n\n**This server also has custom commands,** type \`-commands\` for these.`
          }

          console.log('length', text.length)

          if (text.length >= 2000) {
            message.reply(':no_good: You have too many commands! You might need to ask a bot operator for help.')
          }

          message.reply(text)
        },
        sources: ['dm', 'text']
      })
    ]
  }
}

module.exports = BasicCmd
