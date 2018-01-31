#!/usr/bin/env node
const program = require("commander");

program
	.version("0.0.1")
	.description("deafening roar!!!!")
	.command("project", "create a new application")
	.command("generate", "generate some stuff")
	.alias("gen")
	.parse(process.argv);
