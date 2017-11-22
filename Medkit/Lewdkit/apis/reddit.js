const superagent = require('superagent')

class Reddit {
  constructor (medkit) {
    this.limit = 50
    this.generateRandom = medkit.generateRandom
  }

  command (name) {
    return {
      regex: /\/r\/([a-z0-9_\-A-Z]+) ?(\byear|month|week|day|hour|all\b)?/,
      usage: '/r/<subreddit>',
      help: 'Looks up some stuff on a subreddit.',
      callback: (message, matches) => {
        let reddit = message.Medkit.Lewdkit.Apis.reddit

        reddit.query(matches[0], matches[1] || 'all').then((data) => {
          message.reply(reddit.humanize(data))
        })
      },
      sources: ['text']
    }
  }

  query (subreddit, time = 'all') {
    return new Promise((resolve, reject) => {
      superagent.get(`https://reddit.com/r/${subreddit}/top.json?t=${time}&limit=${this.limit}`).type('json').then((res) => {
        let randLength = (res.body.data.children.length < this.limit) ? res.body.data.children.length : this.limit
        resolve(res.body.data.children[this.generateRandom(randLength)])
      })
    })
  }

  humanize (item) {
    item.data.title = item.data.title.replace(/&amp;/g, '&')
    item.data.url = item.data.url.replace(/&amp;/g, '&')
    return `:hash: **${item.data.title}**\n:link: ${item.data.url}`
  }
}

module.exports = Reddit
