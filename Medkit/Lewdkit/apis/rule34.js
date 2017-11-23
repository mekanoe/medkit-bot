const Danbooru = require('./_danbooruclone')

class Rule34XXX extends Danbooru {
  constructor (medkit) {
    super(medkit)
    this.domain = 'http://rule34.xxx'
  }
}

module.exports = Rule34XXX
