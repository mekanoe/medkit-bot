require('dotenv').config({silent: true})
const Medkit = require('./Medkit/Medkit').boot()

Medkit.import(
	'root',
	'admin',
	'basic',
	'nsfw',
	'timeouts',
	'ps2',
	'lewd'
)