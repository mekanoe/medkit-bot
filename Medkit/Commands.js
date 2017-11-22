const Command = require('./Commands/Command')
const MessageContext = require('./MessageContext')
const ServerContext = require('./ServerContext')
const UserContext = require('./UserContext')

/* ABSTRACT

prelim tasks ->
  cache commands based on sources/server modules and perms

inc message ->
  sanity checks
  build message contexts
  if match ->
    run command(MessageContext, matches.slice(1))

*/

class Commands {
  constructor (medkit) {
    this.medkit = medkit
    this.defaultModules = ['admin', 'basic']
    this.__registry = []
    this.__cache = {}
    this.__rootCmds = [] // a set of global commands for maintenance
  }

  import (...list) {
    list.forEach((m) => {
      new (require(`./Commands/${m}`))(this.medkit) // eslint-disable-line no-new
    })
  }

  register (command, moduleName, opts) {
    if (moduleName === 'root') {
      this.__rootCmds.push({command})
      // console.log('registered root command', command)
    } else {
      this.__registry.push({command, moduleName, opts})
      // console.log('registered general command', command)
    }
  }

  /// /
  // Builds a few command trees to speed up command searches.
  cache () {
    return new Promise((resolve, reject) => {
      this.medkit.Data.getFullServerModuleTree().then((moduleTree) => {
        let newCache = {}

        // L1: source (text, dm)
        //    put all relevant commands into __tmp
        //    do L2 based on __tmp
        //    delete __tmp

        this.__registry.forEach((v) => {
          let { command: { sources } } = v

          sources.forEach((s) => {
            if (newCache[s] === undefined) {
              newCache[s] = { __tmp: [] }
            }

            newCache[s].__tmp.push(v)
          })
        })
        // console.log('L1 done')

        if (newCache.dm !== undefined) {
          // L2-A: DM perms (server modules don't apply)
          newCache.dm.__tmp.forEach((v) => {
            let { opts: { perms } } = v
            if (perms === undefined) {
              perms = 3
            }

            if (newCache.dm[perms] === undefined) {
              newCache.dm[perms] = []
            }

            newCache.dm[perms].push(v)
          })

          delete newCache.dm.__tmp
          // console.log('L2-A done')
        }

        if (newCache.text !== undefined) {
          // L2-B: by server based on modules

          // Generate servers
          this.medkit.client.guilds.array().forEach((server) => {
            let modules = [].concat(moduleTree[server.id], this.defaultModules)

            // console.log(`server <${server.name}> modules: ${modules.join(',')}`)

            newCache.text[server.id] = {
              __tmp: newCache.text.__tmp.filter(v => modules.includes(v.moduleName))
            }
          })

          delete newCache.text.__tmp
          // console.log('L2-B module filter done')

          // L3: by perms
          this.medkit.client.guilds.array().forEach((server) => {
            newCache.text[server.id].__tmp.forEach((v) => {
              let { opts: { perms } } = v
              if (perms === undefined) {
                perms = 3
              }

              if (newCache.text[server.id][perms] === undefined) {
                newCache.text[server.id][perms] = []
              }

              newCache.text[server.id][perms].push(v)
            })

            delete newCache.text[server.id].__tmp
            // console.log('L3 perms map done')
          })
        }

        this.__cache = newCache

        resolve(true)
        // console.log('done')
      })
    })
  }

  /// /
  // Useless resolve tree, used for debugging.
  prettyPrintGlobalResolveTree () {
    return JSON.stringify({ root: this.__rootCmds, tree: this.__cache }, null, '  ')
  }

  /// /
  // @internal
  // Because building contexts is super ugly, we'll do it in it's own function here.
  async buildContext (message, { UC = null, SC = null } = {}) {
    UC = UC || new UserContext(this.medkit, message.author)
    let MC = new MessageContext(this.medkit, message, { UC })

    if (message.channel.type === 'text' && message.guild !== undefined) {
      const server = await this.medkit.Data.getServer((SC !== null) ? SC.id : message.guild.id)
      SC = SC || new ServerContext(this.medkit, message.guild)

      if (server === null) {
      } else {
        SC.attachData(server)
      }

      UC.attachSC(SC)
      MC.SC = SC
    }

    return MC
  }

  /// /
  //
  matcher (cmds, mc) {
    cmds.forEach((i) => {
      let {command} = i
      let match = command.regex.exec(mc.text)
      if (match !== null) {
        console.log(`CMD ${mc.UC.U.username}#${mc.UC.U.discriminator}: ${mc.text}`)
        command.run({medkit: this.medkit}, mc, match.slice(1))
        return false
      }
    })
  }

  /// /
  // Custom command matcher
  customMatcher (mc) {
    if (!mc.SC.hasModule('commands')) {
      return
    }

    let command = mc.text.slice(1).toLowerCase()
    let commands = mc.SC.customCommands

    if (command === 'commands') {
      mc.reply(`:information_desk_person: **Custom commands for this server:**\n\`\`\`css\n${Object.keys(commands).join(', ')}\n\`\`\``)
    }

    if (commands[command] !== undefined) {
      mc.reply(commands[command])
    }
  }

  /// /
  // Resolves a message context's command set from the cache, then passes the set to matcher.
  resolver (mc) {
    // dead code?
    // // first, remove the prefix if it exists.
    // let text = mc.text
    // if (mc.text[0] === '*') {
    //   text = mc.text.slice(1)
    // }

    // next, resolve the role tree.
    let cmdTree = {}

    if (mc.isDM()) {
      // for DMs, this is a flatter tree.
      cmdTree = this.__cache.dm
    } else {
      // for text, this is from the message's server id
      cmdTree = this.__cache.text[mc.SC.id]
    }

    // flatten the tree for what roles we care about
    let cmds = []

    // if user is root, then we'll add root cmds
    if (mc.UC.isRoot()) {
      cmds = cmds.concat(this.__rootCmds)
    }

    // clever switch fallthrough.
    switch (mc.UC.permissions) {
      case 0:
        cmds = cmds.concat(cmdTree['0'])
      case 1: // eslint-disable-line no-fallthrough
        cmds = cmds.concat(cmdTree['1'])
      case 2: // eslint-disable-line no-fallthrough
        cmds = cmds.concat(cmdTree['2'])
      default: // eslint-disable-line no-fallthrough
        cmds = cmds.concat(cmdTree['3'])
    }

    cmds = cmds.filter(c => c !== undefined && c.command instanceof Command)
    return cmds
  }

  /// /
  // @testing
  noCacheResolver (mc) {
    let set = []

    let {modules} = mc.SC
    let {permissions} = mc.UC

    set = this.__registry.filter(c => modules.concat(this.defaultModules).indexOf(c.moduleName) !== -1)
    set = set.filter(c => c.opts.perms >= permissions)

    if (mc.UC.isRoot()) {
      set = set.concat(this.__rootCmds)
    }
    set = set.filter(c => c !== undefined && c.command instanceof Command)
    return set
  }

  /// /
  // @event
  // Handles a Discord->message
  async handler (message, ctxOpts) {
    if (this.medkit.__internal.processMessages === false) {
      return
    }

    if (message.author.bot) {
      return
    }

    if (message.content === '**debug resolve tree') {
      console.log(this.prettyPrintGlobalResolveTree())
    }

    // a message is acceptable if prefix is * (built-in) or - (custom)
    // or if it's a DM.
    if (message.channel.type === 'dm' || message.content[0] === '*' || message.content[0] === '-') {
      let start
      if (this.medkit.__internal.profiler) {
        start = new Date()
      }

      const mc = await this.buildContext(message, ctxOpts)
      let set = []
      if (this.medkit.__internal.noCache) {
        // this is a dumb way of not caching,
        // just rolls through every registered command.
        set = this.noCacheResolver(mc)
      } else {
        set = this.resolver(mc)
      }

      try {
        if (message.content[0] === '-') {
          this.customMatcher(mc)
        } else {
          this.matcher(set, mc)
        }
      } catch (e) {
        console.error(`ERROR: ${e}\n${e.trace || e.stack}`)
      }

      if (this.medkit.__internal.profiler && start !== undefined) {
        mc.reply(`**\\*\\*PROFILER:** took ${new Date() - start}ms.`)
      }
    }
  }
}

module.exports = Commands
