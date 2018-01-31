#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");
const utilities = require("../utilities.js");
const chalk = require("chalk");

let fileNameValue = null;
program.option("-t, --table-name <tableName>", "Specify table name").arguments("<fileName>").action(function(fileName) {
	fileNameValue = fileName;
});
program.parse(process.argv);

if (!fileNameValue) {
	console.log("no file name specified");
	process.exit(1);
} else {
	main(fileNameValue, program.tableName);
}

function main(fileName, tableName) {
	utilities.mkdir("./models", function() {
		fs.appendFile(`./models/${fileName}.js`, getModelBaseCode(fileName, tableName), function() {
			console.log(chalk.green(`\nCreated file ${fileName}.js in /models\n`));
		});
	});
}

function getModelBaseCode(fileName, specifiedTableName) {
	let fileNameArray = fileName.split("-");
	let tableName;
	if (specifiedTableName) {
		tableName = specifiedTableName;
	} else {
		tableName = fileNameArray.join("_");
	}
	let modelName = fileNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	let codeString = `
const Bookshelf = require("../config/bookshelf.js");

const ${modelName} = Bookshelf.Model.extend({
    tableName: "${tableName}",
    hasTimestamps: true,

    //Put Associations Here

});

module.exports = Bookshelf.model("${modelName}", ${modelName});

    `.trim();
	return codeString;
}
