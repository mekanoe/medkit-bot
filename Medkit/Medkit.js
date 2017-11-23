const discord = require('discord.js')
const { Set } = require('immutable')

const Commands = require('./Commands')
const Data = require('./Data')
const Lewdkit = require('./Lewdkit/Lewdkit')
const Listener = require('./Listener')
const Moderation = require('./Moderation/Moderation')

class Medkit {
  constructor () {
    this.__internal = {}
    this.__internal.importBuffer = []

    this.startup()
    .catch((err) => {
      console.error('startup scuffed, exiting', err)
      process.exit(2)
    })
  }

  async startup () {
    // preliminary sanity checks
    if (process.env.DISCORD_TOKEN === undefined) {
      throw new Error('DISCORD_TOKEN must be set for any of this to work.')
    }

    // mount data
    this.Data = new Data(this)

    // setup internal data
    try {
      console.log('... settings')
      this.__internal.settings = await this.Data.getMedkitSettings()
      console.log('✅ settings ok')
    } catch (e) {
      throw new Error('medkit settings scuffed')
    }
    this.__internal.rootUsers = this.getRootUsers()
    this.__internal.processMessages = false
    this.__internal.profiler = false
    this.__internal.noCache = false

    // get discord client, mount working stuff
    this.client = new discord.Client()

    this.Moderation = new Moderation(this)
    this.Commands = new Commands(this)
    this.Listener = new Listener(this)
    this.Lewdkit = new Lewdkit(this)

      // discord login
    this.client.login(process.env.DISCORD_TOKEN)
  }

  /// /
  // Send a message to the global log channel
  //
  // Arguments:
  // - text str{}
  glc (text) {
    console.log(`GLC:\n    ${text}`)

    let glcId = this.__internal.settings.globalLogChannel || ''
    if (glcId !== '') {
      this.client.channels.get(glcId).send(text)
    }
  }

  /// /
  // Send a message to the local log channel
  //
  // Arguments:
  // - text str{}
  llc (server, text) {
    let llcId = this.Data.P.get('servers').get(server).get('logChannel')
    if (llcId !== '') {
      this.client.channels.get(llcId).send(text)
    }
  }

  /// /
  // @event
  // Runs whatever's meant to run at Discord->ready
  async readyScript () {
    console.info('client is ready, doing startup tasks')
    if (process.env.NODE_ENV === 'production') {
      this.glc(`Started at ${new Date()}`)
    }

    console.log(`currently a member of ${this.client.guilds.array().map(v => `${v.name} <${v.id}>`).join(', ')}`)

    let {status_state, status_game} = this.__internal.settings
    this.client.user.setStatus(status_state, status_game)

    this.Commands.autoimport()
    console.log('... command cache')
    try {
      await this.Commands.cache()
    } catch (e) {
      console.error(e)
      throw new Error('command cache scuffed')
    }

    this.__internal.processMessages = true
    console.log('command cache finished.')
    console.log('all done, processing messages.')
  }

  /// /
  // Memoizing root users getter.
  getRootUsers () {
    return this.__internal.rootUsers || Set((process.env.ROOT_USERS || '').split(','))
  }

  /// /
  // Update settings
  async patchSettings (data) {
    console.log('patchSettings', data)
    await this.Data.setKV('settings', data)
    this.__internal.settings = await this.Data.getMedkitSettings()

    this.glc(`Settings updated ---\n${Object.keys(data).map(k => `**${k}** => ${data[k]}`).join('\n')}`)
  }

  isRoot (id) {
    return this.getRootUsers().has(id)
  }

  // util functions
  generateRandom (limit) {
    return Math.floor(Math.random() * limit)
  }
}

module.exports = {
  // syntax sugar for starting
  boot: () => {
    return new Medkit()
  },

  Medkit
}
