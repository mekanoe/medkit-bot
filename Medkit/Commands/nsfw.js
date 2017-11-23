const CommandSet = require('../CommandSet')
const Command = require('../Command')
const ServerContext = require('../ServerContext')

/// /
// Root-level commands
class NSFWCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'nsfw', {perms: 3})
  }

  _boot () {
    this.commands = [
      new Command({
        regex: /help/,
        usage: 'help',
        help: "Tells you about it's day.",
        callback: (message) => {
          message.reply(`Hi ${message.UC.U.username}, I'm an adult friend finder.\n\nI can let you into NSFW channels if you tell me this exactly:\n**I am 18+ and willing to see adult content**\n\nIf you're looking for the other things I can do, type \`*commands\``)
        },
        sources: ['dm']
      }),
      new Command({
        regex: /i am 18\+ and willing to see adult content/i,
        hidden: true,
        callback: (message) => {
          let passed = []
          let failed = []

          Promise.all(this.medkit.client.guilds.map((server) => {
            let GM = server.member(message.UC.U)
            if (GM === undefined) {
              // not in this guild, moving on
            }

            return new Promise((resolve, reject) => {
              this.medkit.Data.getServer(server.id).then((sd) => {
                let SC = new ServerContext(this.medkit, server, sd || null)
                if (SC.modules.indexOf('nsfw') === -1) {
                  // not a nsfw-compliant server
                  return resolve(true)
                }

                if (SC.userHasRole({GM}, 'no_nsfw')) {
                  failed.push(SC)
                  SC.llc(`${message.UC.U.username}#${message.UC.U.discriminator} ${(GM.nickname !== null) ? `(a.k.a. ${GM.nickname}) ` : ''}was caught with a fake I.D.`)
                  return resolve(true)
                }

                GM.addRole(SC.roles.nsfw)
                passed.push(SC)
                SC.llc(`${message.UC.U.username}#${message.UC.U.discriminator} ${(GM.nickname !== null) ? `(a.k.a. ${GM.nickname}) ` : ''}was given the NSFW role.`)
                resolve(true)
              })
            })
          })).then(() => {
            let text = []

            if (failed.length === 0 && passed.length === 0) {
              text.push("Sorry, you're not in a server I do business in.")
            }

            if (passed.length > 0) {
              text.push(`You're now a verified adult in ${passed.map(s => s.S.name).join(', ')}`)
            }

            if (failed.length > 0) {
              text.push(`You were denied NSFW access in ${failed.map(s => s.S.name).join(', ')}`)
            }

            if (failed.length === 0 && passed.length !== 0) {
              text.unshift('Hello fellow adult!')
            }

            // console.log(text.join('\n\n'))
            message.reply(text.join('\n\n'))
          })
        },
        sources: ['dm']
      })
      // new Command({
      //   regex: /i am 18\+ and willing to see adult content/i,
      //   hidden: true,
      //   callback: (message) => {

      //   },
      //   sources: ['dm']
      // })
    ]
  }
}

module.exports = NSFWCmd
