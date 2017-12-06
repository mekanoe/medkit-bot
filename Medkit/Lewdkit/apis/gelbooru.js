const Danbooru = require('./_danbooruclone')

class Gelbooru extends Danbooru {
  constructor (medkit) {
    super(medkit)
    this.domain = 'https://www.gelbooru.com'
  }
}

module.exports = Gelbooru
