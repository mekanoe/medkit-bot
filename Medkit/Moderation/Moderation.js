const Timeouts = require('./Timeouts')

class Moderation {
  constructor (medkit) {
    this.medkit = medkit
    
    this.Timeouts = new Timeouts(medkit)
  }
}

module.exports = Moderation
