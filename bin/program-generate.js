#!/usr/bin/env node
const program = require("commander");

program.command("model", "generate a model").command("dbcrud", "generate crud files in db-service").parse(process.argv);
