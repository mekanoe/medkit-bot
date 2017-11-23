// general danbooru api client
const {parseString} = require('xml2js')
const superagent = require('superagent')

class DanbooruClone {
  constructor (medkit) {
    this.Medkit = medkit
    this.limit = 50
    this.generateRandom = medkit.generateRandom.bind(medkit, this.limit)
    this.domain = 'http://danbooru.donmai.us'
    this.path = `/index.php?page=dapi&s=post&q=index&limit=${this.limit}&tags=`
    this.defaultTags = '-furry'
  }

  command (name) {
    return {
      regex: new RegExp(`${name} (.*)`),
      usage: `${name} <query>`,
      help: `Looks up some stuff on ${name}.`,
      callback: (message, matches) => {
        let c = message.Medkit.Lewdkit.Apis[name]

        c.query(matches[0]).then((data) => {
          message.reply(c.humanize(data))
        })
      },
      sources: ['text']
    }
  }

  query (tags) {
    return new Promise((resolve, reject) => {
      superagent
       .get(`${this.domain}${this.path}${tags} ${this.defaultTags}`)
       .then((data) => {
         parseString(data.text, (err, obj) => {
           if (err != null) {
             reject(err)
           }

           let rv = obj.posts.post[this.generateRandom()]
           console.log(rv)
           resolve(rv)
         })
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
