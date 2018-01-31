#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

module.exports = function(noD, modelName) {
	// TODO: create a file in the models directory named <the first argument>.js
	// let fileName = process.argv[2];
	mkdirp.sync(`./services/db-service/${modelName}`);
	console.log(`Created folder ./services/db-service/${modelName} ...`);

	fs.appendFileSync(`./services/db-service/${modelName}/create.js`, getCreateBaseCode(modelName));
	console.log(`Created file create.js in /services/db-service/${modelName} ...`);

	fs.appendFileSync(`./services/db-service/${modelName}/edit.js`, getEditBaseCode(modelName));
	console.log(`Created file edit.js in /services/db-service/${modelName} ...`);

	fs.appendFileSync(`./services/db-service/${modelName}/find-by-id.js`, getFindByIdBaseCode(modelName));
	console.log(`Created file find-by-id.js in /services/db-service/${modelName} ...`);

	fs.appendFileSync(`./services/db-service/${modelName}/find-all.js`, getFindAllBaseCode(modelName));
	console.log(`Created file find-all.js in /services/db-service/${modelName} ...`);

	fs.appendFileSync(`./services/db-service/${modelName}/index.js`, getIndexBaseCode(noD));
	console.log(`Created file index.js in /services/db-service/${modelName} ...`);

	if (!noD) {
		fs.appendFileSync(`./services/db-service/${modelName}/destroy.js`, getDestroyBaseCode(modelName));
		console.log(`Created file destroy.js in /services/db-service/${modelName} ...`);
	}

	regenerateDBServiceIndex();
};

function getCreateBaseCode(entityName) {
	let fileNameArray = entityName.split("-");

	let modelName = fileNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	let codeString = `
    const ${modelName} = require("../../../models/${entityName}.js");

    module.exports = async function(args) {
    	return await ${modelName}.forge().save(
    		{
    			//put create fields Here
                //fields: args.field
    		},
    		{ method: "insert" }
    	);
    };

    `;
	return codeString;
}

function getEditBaseCode(entityName) {
	let fileNameArray = entityName.split("-");

	let modelName = fileNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	let codeString = `
    const ${modelName} = require("../../../models/${entityName}.js");

module.exports = async function(entityId, args) {
	return await ${modelName}.forge({
		id: entityId
	}).save(
		{
            //put edit fields Here
            //fields: args.field
		},
		{ method: "update" }
	);
};

    `;
	return codeString;
}

function getFindByIdBaseCode(entityName) {
	let fileNameArray = entityName.split("-");

	let modelName = fileNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	let codeString = `
    const ${modelName} = require("../../../models/${entityName}.js");

    module.exports = async function(entityId, withRelatedArray) {
    	return await ${modelName}.forge({
    		id: entityId
    	}).fetch({ withRelated: withRelatedArray });
    };

    `;
	return codeString;
}

function getFindAllBaseCode(entityName) {
	let fileNameArray = entityName.split("-");

	let modelName = fileNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	let codeString = `
    const ${modelName} = require("../../../models/${entityName}.js");

    module.exports = async function(withRelatedArray) {
    	return await ${modelName}.forge().fetchAll({
    		withRelated: withRelatedArray
    	});
    };

    `;
	return codeString;
}

function getDestroyBaseCode(entityName) {
	let fileNameArray = entityName.split("-");

	let modelName = fileNameArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");
	let codeString = `
    const ${modelName} = require("../../../models/${entityName}.js");

    module.exports = async function(id){
      await ${modelName}.forge({id: id}).destroy();
    };

    `;
	return codeString;
}

function getIndexBaseCode(noD) {
	let codeString = `
    const create = require("./create.js");
    const findAll = require("./find-all.js");
    const findById = require("./find-by-id.js");
    const edit = require("./edit.js");
    ${noD ? `` : `const destroy = require("./destroy.js");`}

    module.exports = {
    	create: create,
    	findAll: findAll,
    	findById: findById,
    	edit: edit,
        ${noD ? `` : `destroy: destroy`}
    };

    `;
	return codeString;
}

function regenerateDBServiceIndex() {
	let directories = getDirectories("./services/db-service/");
	let directoryNames = directories.map(function(dir) {
		return dir.split("/").pop();
	});
	console.log("dirNames:");
	console.log(directoryNames);

	let indexCodeString = `${directoryNames.map(name => `const ${hiphenToCamelCase(name)}= require("./${name}");\n`).join("")}

module.exports = {
${directoryNames
		.map(function(name) {
			return `  ${hiphenToCamelCase(name)}: ${hiphenToCamelCase(name)},\n`;
		})
		.join("")}
}
    `;

	fs.writeFileSync(`./services/db-service/index.js`, indexCodeString);
	console.log(`Regenerated /services/db-service/index.js ...`);
}

const isDirectory = function functionName(source) {
	return fs.lstatSync(source).isDirectory();
};
const getDirectories = function(source) {
	return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
};

const hiphenToCamelCase = function(hiphenWord) {
	let hiphenWordArray = hiphenWord.split("-");

	let capitalized = hiphenWordArray.reduce(function(finalString, word) {
		return finalString + (word.charAt(0).toUpperCase() + word.slice(1));
	}, "");

	camelCaseWord = capitalized.charAt(0).toLowerCase() + capitalized.slice(1);
	return camelCaseWord;
};
