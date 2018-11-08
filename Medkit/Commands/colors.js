const CommandSet = require('../CommandSet')
const Command = require('../Command')

/// /
// Root-level commands
class ColorsCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'colors', {perms: 3})
  }
  _boot () {
    const getRolePosition = ({SC}) => {
      if ('colors:marker' in SC.roles) {
        const role = SC.S.roles.get(SC.roles['colors:marker'])
        if (role != null) {
          return role.position + 1
        }
      }
      return undefined
    }

    this.commands = [
      new Command({
        regex: /color ([a-zA-Z0-9 ]+) ?#?([a-fA-F0-9]{3,6})?/,
        usage: 'color red #ff0000',
        help: 'Sets a color',
        callback: async (message, matches) => {
          // console.log({matches})
          matches = matches.map(x => x != null ? ('' + x).trim() : x)
          const [name, color] = matches
          
          let role = message.SC.S.roles.find(x => x.name === `${name} 🔸`)
          // console.log({name, color, hasRole: role != null})
          if (role != null) { // role is found
            if (role.members.has(message.UC.id)) {
              message.reply(`<:akkoshrug:387846714414989312> You already have that role.`)
              return
            }

            message.UC.GM.addRole(role)

            if (color != null) { // color is set, so complain
              message.reply(`<:akkoshrug:387846714414989312> ${name} was already set by someone else, so you get that one instead.\n\`*remove color ${name}\` will undo this.`)
            } else {
              message.reply(`✅ Done!`)
            }
          } else {
            if (color == null) {
              message.reply(`❗️ That role didn't exist, so I need a color to create ${name}.`)
              return
            }
            role = await message.SC.S.createRole({ name: `${name} 🔸`, permissions: 0, color: color })
            
            try {
              await role.setPosition(getRolePosition(message))
            } catch (e) { // likely perms error.
              const posRole = message.SC.S.roles.find(x => x.name.includes('🔸'))
              if (posRole != null) {
                try {
                  await role.setPosition(posRole.position + 1)
                } catch (e) {
                  // oh well.
                }
              }
            }
            
            message.UC.GM.addRole(role)
            message.reply(`✅ Done!`)
          }
        },
        sources: ['text']
      }),
      new Command({
        regex: /remove color (.*)/,
        usage: 'remove color red',
        help: 'Removes a color from you. If it is the last instance of it, the color is removed from the list.',
        callback: async (message, matches) => {
          const name = matches[0]
          const role = message.UC.GM.roles.find(x => x.name === `${name} 🔸`)

          if (role == null) {
            message.reply(`<:akkoshrug:387846714414989312> You don't have ${name}.`)
            return
          }

          await message.UC.GM.removeRole(role)
          await message.reply(`✅ Done!`)

          // console.log({memberCount: role.members})
          if (role.members.array().length === 0) {
            await role.delete(`No more members have this role, last to leave was ${message.UC.U.username}.`)
            message.reply(`🚮 No one has ${name} anymore, so it's now deleted.`)
          }
        },
        sources: ['text']
      })
    ]
  }
}

module.exports = ColorsCmd
