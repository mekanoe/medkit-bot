// general danbooru api client
const {parseString} = require('xml2js')
const superagent = require('superagent')

class DanbooruClone {
  constructor (medkit) {
    this.Medkit = medkit
    this.limit = 50
    this.generateRandom = medkit.generateRandom.bind(medkit)
    this.domain = 'http://danbooru.donmai.us'
    this.path = `/index.php?page=dapi&s=post&q=index&limit=${this.limit}&tags=`
    this.defaultTags = ['-furry']
  }

  command (name) {
    return {
      regex: new RegExp(`${name} (.*)`),
      usage: `${name} <query>`,
      help: `Looks up some stuff on ${name}.`,
      callback: async (message, matches) => {
        try {
          const c = message.Medkit.Lewdkit.Apis[name]
          const data = await c.query(matches[0])
          
          if (data == null) {
            message.reply(`<:akkoshrug:387846714414989312> Couldn't find anything.`)
            return
          }
          
          message.reply(c.humanize(data))
        } catch (err) {
          throw err
        }
      },
      sources: ['text']
    }
  }

  async query (tags) {
    const url = `${this.domain}${this.path}${[...tags.split(' '), ...this.defaultTags].join('+')}`
    console.log(url)
    const data = await superagent.get(url)
    const { posts } = await this.parseXml(data.text)
    console.log(posts)

    if (posts.post === undefined || posts.post.length === '0') {
      return null
    }

    let rv = posts.post[this.generateRandom(posts.post.length)]
    return rv
  }

  parseXml (xml) {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, obj) => {
        if (err != null) {
          reject(err)
        }

        resolve(obj)
      })
    })
  }

  humanize (item) {
    if (item.$.file_url[0] === '/') {
      item.$.file_url = 'https:' + item.$.file_url
    }

    return `:frame_photo: ${item.$.file_url}\n`
  }
}

module.exports = DanbooruClone
