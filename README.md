# Medkit
Medkit is a ridiculously modular Discord bot. At the time of writing, the bot plays 4 quite different roles in 4 quite different servers. At the moment, setting the bot up is a quite manual process. This will be improved in later releases. It also does not support sharding at this time.

## Starting the bot

If you have Docker and don't want to make any changes, this part is easy. You can `docker pull katie/medkit-bot` and you got it boss. The following is an example start command,

```
docker run -d --name=medkit --restart=always \
    -v /var/lib/medkit:/data \
    -e DISCORD_TOKEN=MjMwOTEyNNEONRAINBOWS.XXXXXX.ll29F_XXXXXXXX_KHiUMsMGr2E \
    -e ROOT_USERS=62601999618889728,6244444448889728 \
    -e DISCORD_CLIENT_ID=230912594499999964 \
    -e NODE_ENV=production \
        katie/medkit-bot
```

You'll need a [Discord API application](https://discordapp.com/developers/applications/me/create), a bot user, and your (and possibly a friend's) user ID. Fill `DISCORD_TOKEN` with your bot user's token, optionally (and highly recommended) fill `DISCORD_CLIENT_ID` with your application's Client ID, and last, fill `ROOT_USERS` in with the user IDs you'd like to have all of the power, using a comma to separate multiple users. 

## Getting the bot in your guild/server

Simple! DM or ask Medkit in a server, `*joinurl`, and if you filled `DISCORD_CLIENT_ID` earlier, you'll be able to make it join any server you currently have elevated privileges on. 

If you can't find your bot for some reason, or you didn't want to fill in that env var earlier, https://discordapp.com/oauth2/authorize?scope=bot&client_id=YOUR_CLIENT_ID_HERE will do the trick too.

### Setup commands

- *Currently as a bug workaround, DM Medkit `\*recache` or restart the bot before continuing*

- `*init server`

- `*add role admin <name of admin role>`, (optional,) ex. `*add role admin Admins`

- `*add role mod <name of mod role>` (optional)

## Using modules

Medkit is a modular machine, and comes with batteries uninstalled.

- `*add module <name>` to add a module

- `*rm module <name>` to remove a module

- `*get modules` to list all modules enabled

### Modules available

These will be more thoroughly documented in the future.

| Module name       |                                          |
| ----------------- | ---------------------------------------- |
| `timeouts`        | gives users a role to make them be quiet |
| `nsfw`            | an 18+ gatekeeper                        |
| `lewd`            | an 18+ platter                           |
| `ps2`             | gives users a role based on input        |
| `commands`        | custom commands system                   |

