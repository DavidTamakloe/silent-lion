#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");
const utilities = require("../utilities.js");
const chalk = require("chalk");

let entityNameValue = null;
program.option("-D, --no-destroy", "Dont create a destroy file").arguments("<entityName>").action(function(entityName) {
	entityNameValue = entityName;
});
program.parse(process.argv);

if (!entityNameValue) {
	console.log("Please provide entity-name");
	process.exit(1);
} else {
	main(entityNameValue, program.noDestroy);
}
function main(entityName, noD) {
	utilities.mkdir(`./services/db-service/${entityName}`, function() {
		let createTemplate = utilities.loadTemplate("services/db-service/create.js");
		let destroyTemplate = utilities.loadTemplate("services/db-service/destroy.js");
		let editTemplate = utilities.loadTemplate("services/db-service/edit.js");
		let findByIdTemplate = utilities.loadTemplate("services/db-service/find-by-id.js");
		let findAllTemplate = utilities.loadTemplate("services/db-service/find-all.js");
		let entityIndexTemplate = utilities.loadTemplate("services/db-service/entity-index.js");
		let locals = {
			entityName: entityName,
			modelName: getModelNameFromEntityName(entityName),
			noD: noD
		};
		createTemplate.locals.entityName = destroyTemplate.locals.entityName = editTemplate.locals.entityName = findByIdTemplate.locals.entityName = findAllTemplate.locals.entityName =
			locals.entityName;
		createTemplate.locals.modelName = destroyTemplate.locals.modelName = editTemplate.locals.modelName = findByIdTemplate.locals.modelName = findAllTemplate.locals.modelName =
			locals.modelName;
		entityIndexTemplate.locals.noD = locals.noD;
		utilities.write(`./services/db-service/${entityName}/create.js`, createTemplate.render());
		utilities.write(`./services/db-service/${entityName}/edit.js`, editTemplate.render());
		utilities.write(`./services/db-service/${entityName}/index.js`, entityIndexTemplate.render());
		utilities.write(`./services/db-service/${entityName}/find-by-id.js`, findByIdTemplate.render());
		utilities.write(`./services/db-service/${entityName}/find-all.js`, findAllTemplate.render());
		if (!noD) {
			utilities.write(`./services/db-service/${entityName}/destroy.js`, destroyTemplate.render());
		}
		regenerateDBServiceIndex();
	});
}

//transforms hyphenated to capitalized.
function getModelNameFromEntityName(entityName) {
	let entityNameArray = entityName.split("-");
	let modelName = entityNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	return modelName;
}

function regenerateDBServiceIndex() {
	let directories = utilities.getDirectories("./services/db-service/");
	let directoryNames = directories.map(function(dir) {
		return dir.split("/").pop();
	});

	let indexCodeString = `
/**
* services/db-service/index
*
* @description:: Index file for the database services.
* This file is regenerated automatically when a new entity is added to the db-service.
* It is important to ensure that you don't put files in the db-service root.
*
*/

${directoryNames.map(name => `const ${hiphenToCamelCase(name)} = require("./${name}");\n`).join("")}
module.exports = {
${directoryNames
		.map(function(name) {
			return `	${hiphenToCamelCase(name)}: ${hiphenToCamelCase(name)},\n`;
		})
		.join("")}
};
	`.trim();

	fs.writeFileSync(`./services/db-service/index.js`, indexCodeString);
	console.log(chalk.green(`\nRegenerated /services/db-service/index.js\n`));
}

const hiphenToCamelCase = function(hiphenWord) {
	let hiphenWordArray = hiphenWord.split("-");

	let capitalized = hiphenWordArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");

	let camelCaseWord = capitalized.charAt(0).toLowerCase() + capitalized.slice(1);
	return camelCaseWord;
};
