/*
#######
# OLD DATA
#######
{
  "203493697696956418": {
    "lewd":"203494795124015104",
    "safe":"203494679713415168",
    "logChannel":"239328426681565186"
  }
}

#######
# NEW DATA
#######

{
  "schema": 2,
  "servers":{
    "203493697696956418": {
      modules: ["nsfw"],
      prefix: "!",
      roles: {
        "mute": "",
        "nsfw": "203494795124015104",
        "no_nsfw": "203494679713415168",
        "moderator": "",
        "admin": "",
      },
      logChannel: "239328426681565186"
    }
  },
  "status":{
    "state":"online",
    "game":"DM me `help`"
  },
  "globalLogChannel":"239328426681565186",
  "adminPrefix": "*",
}
*/

const FILE = process.argv[2]
const fs = require('fs')

let f = fs.readFileSync(FILE, 'utf8')

let oldData = JSON.parse(f)

let newData = {
  schema: 2,
  servers: Object.keys(oldData).map((k) => {
    let v = oldData[k]
    return {
      modules: ['nsfw'],
      roles: {
        nsfw: v.lewd,
        no_nsfw: v.safe,
        mute: '',
        moderator: '',
        admin: ''
      },
      logChannel: v.logChannel
    }
  }),
  status: {
    state: 'online',
    game: 'DM me `help`'
  },
  globalLogChannel: ''
}

fs.writeFileSync(FILE.replace('data.json', 'medkit-data.json'), JSON.stringify(newData), 'utf8')
