#!/usr/bin/env node
const program = require("commander");
const addDBServiceCRUD = require("../utilities/add-db-service-crud.js");

let entityNameValue = null;
program.option("-D, --no-destroy", "Dont create a destroy file").arguments("<entityName>").action(function(entityName) {
	entityNameValue = entityName;
});
program.parse(process.argv);

if (!entityNameValue) {
	console.log("Please provide entity-name");
	process.exit(1);
}
addDBServiceCRUD(program.noDestroy, entityNameValue);
