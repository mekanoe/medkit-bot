-- SQLite3-based, maybe can do PgSQL in the future if it gets serious.

---------------
-- SERVERS ---
-------------
CREATE TABLE servers (
	server_id TEXT PRIMARY KEY, -- TEXT because Discord API IDs are very long
	modules TEXT, 				-- module1,module2,...,moduleN
	logChannel TEXT
);

CREATE TABLE servers_roles (	-- a fluid one-to-many so we don't have to alter the db
	server_id TEXT,				-- key from server table
	role_spec TEXT,				-- nsfw, no_nsfw, admin, etc
	role_id TEXT				-- ID of the role in Discord
);

CREATE INDEX servers_roles_id ON servers_roles (server_id);


-----------------------
-- MEDKIT SETTINGS ---
---------------------
CREATE TABLE settings (			-- A SQL KV for simplicity. (pg: hstore?)
	key TEXT PRIMARY KEY,
	value TEXT
);

-- Setup the default settings
INSERT INTO settings (key, value) VALUES 
	('status_game', 'DM me `help`'),
	('status_state', 'online'),
	('globalLogChannel','');

