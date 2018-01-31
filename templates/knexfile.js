/**
 * knexfile.js
 *
 * @description: configuration file for knex. specifies which database knex connects to
 * Remember to set all required environment variables before running the app.
 *
 **/

module.exports = {
	development: {
		client: "pg",
		connection: {
			host: "127.0.0.1",
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.DATABASE_NAME
		}
	},
	test: {
		client: "pg",
		connection: {
			host: "127.0.0.1",
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.DATABASE_NAME
		}
	},
	production: {
		client: "pg",
		connection: process.env.DATABASE_URL,
		ssl: true
	}
};
