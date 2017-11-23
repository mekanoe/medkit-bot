class Listener {
  constructor (medkit) {
    this.medkit = medkit
    this.Client = this.medkit.client

    let alreadyReady = false

    this.Client.on('ready', async () => {
      if (alreadyReady) {
        // medkit.glc('Discord client sent ready and I was already ready.')
        return
      }

      alreadyReady = true
      try {
        await medkit.readyScript()
      } catch (err) {
        console.error('ready script scuffed', err)
        process.exit(2)
      }
    })
    this.Client.on('message', medkit.Commands.handler.bind(medkit.Commands))
    this.Client.on('guildCreate', async guild => {
      medkit.glc(`Joined ${guild.name} (${guild.id})`)
      medkit.glc(`... Recaching command tree`)
      await medkit.Commands.cache()
      medkit.glc(`... Initializing server`)
      await medkit.Data.initServer({ id: guild.id })
      medkit.glc(`Done. Ready to roll.`)
    })
  }
}

module.exports = Listener
