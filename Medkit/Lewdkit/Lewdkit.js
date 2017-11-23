const Command = require('../Command')
const glob = require('glob')
const path = require('path')

class Lewdkit {
  constructor (medkit) {
    this.Medkit = medkit
    this.Data = medkit.Data

    this.Apis = {}
    this.autoimport()
  }

  autoimport () {
    const cmdpkg = glob.sync(path.join(__dirname, 'apis', '*.js'))
    for (let pkg of cmdpkg) {
      const path = pkg.replace(__dirname, '.')
      if (path[2] === '_') {
        continue
      }
      const p = new (require(path))(this.Medkit) // eslint-disable-line no-new
      this.Apis[p.constructor.name.toLowerCase()] = p
    }
  }

  apisToCommandArray () {
    return Object.keys(this.Apis).map((k) => {
      let v = this.Apis[k]
      if (v.command !== undefined) {
        const cmd = new Command(v.command(k))

        cmd.callback = this.wrapCallback(cmd.callback)

        return cmd
      }
    })
  }

  wrapCallback (cb) {
    return (message, matches) => {
      if (message.M.channel.nsfw) {
        cb(message, matches)
      }
    }
  }
}

module.exports = Lewdkit
