#!/usr/bin/env node
const program = require("commander");
const addModel = require("../utilities/add-model.js");

let fileNameValue = null;
program.option("-t, --table-name <tableName>", "Specify table name").arguments("<fileName>").action(function(fileName) {
	fileNameValue = fileName;
});
program.parse(process.argv);

if (!fileNameValue) {
	console.log("no file name specified");
	process.exit(1);
}
addModel(fileNameValue, program.tableName);
