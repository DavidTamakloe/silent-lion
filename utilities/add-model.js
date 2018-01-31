#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const program = require("commander");

module.exports = function(fileName, tableName) {
	// TODO: create a file in the models directory named <the first argument>.js
	// let fileName = process.argv[2];
	mkdirp.sync("./models");
	fs.appendFile(`./models/${fileName}.js`, getModelBaseCode(fileName, tableName), function() {
		console.log(`Created file ${fileName}.js in /models`);
	});
};

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

    `;
	return codeString;
}
