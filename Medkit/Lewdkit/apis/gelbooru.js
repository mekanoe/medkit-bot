const Danbooru = require('./_danbooruclone')

class Gelbooru extends Danbooru {
  constructor (medkit) {
    super(medkit)
    this.domain = 'http://www.gelbooru.com'
  }
}

module.exports = Gelbooru
