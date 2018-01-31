/**
 *
 * config/bookshelf.js
 *
 * @description:: config file for knex, and bookshelf.
 *
 */

const pg = require("pg");
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
let knexfile = require("../knexfile.js");
let knex = require("knex")(knexfile[process.env.NODE_ENV]);
let bookshelf = require("bookshelf")(knex);
bookshelf.plugin("registry"); // Resolve circular dependencies with relations
bookshelf.plugin("pagination");

module.exports = bookshelf;
