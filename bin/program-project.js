#!/usr/bin/env node

var program = require("commander");
var sortedObject = require("sorted-object");
const execSync = require("child_process").execSync;
const exec = require("child_process").exec;
const chalk = require("chalk");
const utilities = require("../utilities.js");
const fs = require("fs");
const Spinner = require("cli-spinner").Spinner;

// Re-assign process.exit because of commander
const exit = (process.exit = utilities.getNewExit());

utilities.around(program, "optionMissingArgument", function(fn, args) {
	program.outputHelp();
	fn.apply(this, args);
	return { args: [], unknown: [] };
});

utilities.before(program, "outputHelp", function() {
	// track if help was shown for unknown option
	this._helpShown = true;
});

utilities.before(program, "unknownOption", function() {
	// allow unknown options if help was shown, to prevent trailing error
	this._allowUnknownOption = this._helpShown;

	// show help if not yet shown
	if (!this._helpShown) {
		program.outputHelp();
	}
});

program.description("create a new application").usage("[options] [dir]").option("-f, --force", "force on non-empty directory").parse(process.argv);

if (!exit.exited) {
	main();
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

async function createApplication(name, path, postgresUser, postgresPassword, databaseName) {
	await generateFileStructure(name, path, postgresUser, postgresPassword, databaseName);
	await runDependencyInstaller(name);

	createAdminsTableMigration(path, name);
	console.log(chalk.green(`\n\nYour project has been created! Remember to run migraions to create the admins table. \nHappy Coding!`));
}

/**
 * Main program.
 */
async function main() {
	var destinationPath = program.args.shift() || ".";
	var appName = utilities.createAppName(destinationPath) || "hello-world";

	let postgresUser = "postgres";
	let postgresPassword = "password";
	let databaseName = appName + "_development";

	postgresUser = await utilities.getUserInput("Enter Postgres User: ");
	postgresPassword = await utilities.getUserInput("Enter Postgres Password: ");
	databaseName = await utilities.getUserInput("Enter Database Name: ");

	let empty = await utilities.emptyDirectory(destinationPath);
	if (empty || program.force) {
		await createApplication(appName, destinationPath, postgresUser, postgresPassword, databaseName);
	} else {
		let confirmed = await utilities.confirm("destination is not empty, continue? [y/N] ");
		if (confirmed) {
			process.stdin.destroy();
			await createApplication(appName, destinationPath, postgresUser, postgresPassword, databaseName);
		} else {
			console.error("aborting");
			exit(1);
		}
	}
}

const runDependencyInstaller = function(name) {
	return new Promise(function(resolve, reject) {
		try {
			console.log(chalk.cyan("installing dependencies... "));
			let spinner = new Spinner("installing... %s");
			let depInstallerChildProcess = exec(`cd ${name} && npm install`);
			spinner.setSpinnerString("⣾⣽⣻⢿⡿⣟⣯⣷");
			spinner.start();
			depInstallerChildProcess.on("exit", () => {
				spinner.stop();
				console.log(chalk.cyan(`\nDependency installer finished!\n\n`));
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

const createAdminsTableMigration = function(path, name) {
	console.log(chalk.cyan("creating admins table in database... "));
	let initializerResponse = execSync(`cd ${name} && knex migrate:make create_admins_table`);
	console.log(initializerResponse.toString());
	let migrationName = fs.readdirSync(path + "/migrations")[0];
	utilities.copyTemplate("migrations/create_admins_table.js", path + "/migrations/" + migrationName);
};

/**
 * Generate File Structure.
 *
 * @param {String} path
 */
const generateFileStructure = function(name, path, postgresUser, postgresPassword, databaseName) {
	return new Promise(function(resolve, reject) {
		try {
			//Create file structure
			utilities.mkdir(path, async function() {
				let promiseArray = [
					generateBinDirectory(path, name),
					generateConfigDirectory(path),
					generateEnvDirectory(path, postgresUser, postgresPassword, databaseName),
					generateLogsDirectory(path),
					generateMigrationsDirectory(path),
					generateModelsDirectory(path),
					generatePublicDirectory(path),
					generateRoutesDirectory(path, name),
					generateServicesDirectory(path),
					generateViewsDirectory(path)
				];
				await Promise.all(promiseArray);

				generatePackageJson(path, name);
				generateRootFiles(path);
				console.log(chalk.cyan("File structure created! "));
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

//Generator functions
const generateRootFiles = function(path) {
	//app.js
	let app = utilities.loadTemplate("app.js");
	app.locals.modules = Object.create(null);
	app.locals.uses = [];
	utilities.write(path + "/app.js", app.render());

	utilities.copyTemplate("gitignore", path + "/.gitignore");
	utilities.copyTemplate("knexfile.js", path + "/knexfile.js");
	utilities.copyTemplate("Gruntfile.js", path + "/Gruntfile.js");
	utilities.copyTemplate("eslintrc", path + "/.eslintrc");
};

const generatePackageJson = function(path, name) {
	let pkg = {
		name: name,
		version: "0.0.0",
		private: true,
		scripts: {
			start: "node ./bin/www",
			rundev: "grunt rundev",
			build: "grunt build"
		},
		dependencies: {
			bcrypt: "^1.0.2",
			"body-parser": "~1.18.2",
			bookshelf: "^0.10.3",
			"connect-flash": "^0.1.1",
			"connect-mongo": "^1.3.2",
			"cookie-parser": "~1.4.3",
			debug: "~2.6.9",
			ejs: "^2.5.6",
			express: "~4.15.5",
			"express-session": "^1.15.3",
			forever: "^0.15.3",
			knex: "^0.12.6",
			mongoose: "^4.10.7",
			morgan: "~1.9.0",
			pg: "^6.2.4",
			"serve-favicon": "~2.4.5",
			winston: "^2.3.1",
			"winston-daily-rotate-file": "^1.4.6"
		},
		devDependencies: {
			autoprefixer: "^7.2.2",
			"eslint-config-defaults": "^9.0.0",
			grunt: "^1.0.1",
			"grunt-babel": "^6.0.0",
			"grunt-concurrent": "^2.3.1",
			"grunt-contrib-cssmin": "^2.2.0",
			"grunt-contrib-less": "^1.4.1",
			"grunt-contrib-sass": "^1.0.0",
			"grunt-contrib-uglify": "^2.3.0",
			"grunt-contrib-watch": "^1.0.0",
			"grunt-env": "^0.4.4",
			"grunt-nodemon": "^0.4.2",
			"grunt-postcss": "^0.9.0",
			nodemon: "^1.11.0"
		}
	};

	// sort dependencies like npm(1)
	pkg.dependencies = sortedObject(pkg.dependencies);

	utilities.write(path + "/package.json", JSON.stringify(pkg, null, 2) + "\n");
};

const generateBinDirectory = function(path, name) {
	return new Promise(function(resolve, reject) {
		try {
			let www = utilities.loadTemplate("www");
			www.locals.name = name;
			//bin directory
			utilities.mkdir(path + "/bin", function() {
				utilities.write(path + "/bin/www", www.render(), utilities.constants.MODE_0755);
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateViewsDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		let wait = 4;
		function complete() {
			if (--wait) {
				return;
			}
			resolve();
		}
		try {
			utilities.mkdir(path + "/views", function() {
				utilities.mkdir(path + "/views/main");
				utilities.mkdir(path + "/views/errors", function() {
					utilities.copyTemplate("views/error.ejs", path + "/views/errors/404.ejs");
					utilities.copyTemplate("views/error.ejs", path + "/views/errors/500.ejs");
					complete();
				});
				utilities.mkdir(path + "/views/backoffice", function() {
					utilities.mkdir(path + "/views/backoffice/components", function() {
						utilities.copyTemplate("views/backoffice/components/flash.ejs", path + "/views/backoffice/components/flash.ejs");
						complete();
					});
					utilities.mkdir(path + "/views/backoffice/essentials", function() {
						utilities.copyTemplate("views/backoffice/essentials/scripts.ejs", path + "/views/backoffice/essentials/scripts.ejs");
						utilities.copyTemplate("views/backoffice/essentials/styles.ejs", path + "/views/backoffice/essentials/styles.ejs");
						complete();
					});
					utilities.mkdir(path + "/views/backoffice/pages", function() {
						utilities.copyTemplate("views/backoffice/pages/home.ejs", path + "/views/backoffice/pages/home.ejs");
						utilities.copyTemplate("views/backoffice/pages/login.ejs", path + "/views/backoffice/pages/login.ejs");
						complete();
					});
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateServicesDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		let wait = 1;
		function complete() {
			if (--wait) {
				return;
			}
			resolve();
		}
		try {
			utilities.mkdir(path + "/services", function() {
				utilities.mkdir(path + "/services/db-service", function() {
					utilities.copyTemplate("services/db-service/index.js", path + "/services/db-service/index.js");
					utilities.mkdir(path + "/services/db-service/admin", function() {
						let createTemplate = utilities.loadTemplate("services/db-service/create.js");
						let destroyTemplate = utilities.loadTemplate("services/db-service/destroy.js");
						let editTemplate = utilities.loadTemplate("services/db-service/edit.js");
						let findByIdTemplate = utilities.loadTemplate("services/db-service/find-by-id.js");
						let findByEmailTemplate = utilities.loadTemplate("services/db-service/find-by-email.js");
						let findAllTemplate = utilities.loadTemplate("services/db-service/find-all.js");
						let locals = {
							entityName: "admin",
							modelName: "admin",
							fields: ["first_name", "last_name", "other_names", "email", "password", "access_level"],
							noD: false
						};
						createTemplate.locals.entityName = destroyTemplate.locals.entityName = editTemplate.locals.entityName = findByIdTemplate.locals.entityName = findByEmailTemplate.locals.entityName = findAllTemplate.locals.entityName =
							locals.entityName;
						createTemplate.locals.modelName = destroyTemplate.locals.modelName = editTemplate.locals.modelName = findByIdTemplate.locals.modelName = findByEmailTemplate.locals.modelName = findAllTemplate.locals.modelName =
							locals.modelName;
						createTemplate.locals.fields = editTemplate.locals.fields = locals.fields;
						utilities.write(path + "/services/db-service/admin/create.js", createTemplate.render());
						utilities.write(path + "/services/db-service/admin/edit.js", editTemplate.render());
						utilities.write(path + "/services/db-service/admin/destroy.js", destroyTemplate.render());
						utilities.write(path + "/services/db-service/admin/find-by-id.js", findByIdTemplate.render());
						utilities.write(path + "/services/db-service/admin/find-by-email.js", findByEmailTemplate.render());
						utilities.write(path + "/services/db-service/admin/find-all.js", findAllTemplate.render());
						utilities.copyTemplate("services/db-service/admin-index.js", path + "/services/db-service/admin/index.js");
						complete();
					});
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateRoutesDirectory = function(path, name) {
	return new Promise(function(resolve, reject) {
		let wait = 3;
		function complete() {
			if (--wait) {
				return;
			}
			resolve();
		}
		try {
			utilities.mkdir(path + "/routes", function() {
				utilities.copyTemplate("routes/index.js", path + "/routes/index.js");
				utilities.mkdir(path + "/routes/api", function() {
					utilities.copyTemplate("routes/api/index.js", path + "/routes/api/index.js");
					utilities.mkdir(path + "/routes/api/policies", function() {
						utilities.copyTemplate("routes/api/policies/index.js", path + "/routes/api/policies/index.js");
						complete();
					});
				});
				utilities.mkdir(path + "/routes/backoffice", function() {
					utilities.copyTemplate("routes/backoffice/index.js", path + "/routes/backoffice/index.js");
					utilities.copyTemplate("routes/backoffice/create-admin.js", path + "/routes/backoffice/create-admin.js");
					utilities.copyTemplate("routes/backoffice/login.js", path + "/routes/backoffice/login.js");
					utilities.copyTemplate("routes/backoffice/logout.js", path + "/routes/backoffice/logout.js");
					utilities.copyTemplate("routes/backoffice/show-login-page.js", path + "/routes/backoffice/show-login-page.js");
					let homePageTemplate = utilities.loadTemplate("routes/backoffice/show-home-page.js");
					homePageTemplate.locals.appName = name;
					utilities.write(path + "/routes/backoffice/show-home-page.js", homePageTemplate.render());
					utilities.mkdir(path + "/routes/backoffice/policies", function() {
						utilities.copyTemplate("routes/backoffice/policies/index.js", path + "/routes/backoffice/policies/index.js");
						utilities.copyTemplate("routes/backoffice/policies/is-logged-in.js", path + "/routes/backoffice/policies/is-logged-in.js");
						complete();
					});
				});
				utilities.mkdir(path + "/routes/main", function() {
					utilities.copyTemplate("routes/main/index.js", path + "/routes/main/index.js");
					utilities.mkdir(path + "/routes/main/policies", function() {
						utilities.copyTemplate("routes/main/policies/index.js", path + "/routes/main/policies/index.js");
						complete();
					});
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generatePublicDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		let wait = 4;
		function complete() {
			if (--wait) {
				return;
			}
			resolve();
		}
		try {
			utilities.mkdir(path + "/public", function() {
				utilities.mkdir(path + "/public/images");
				utilities.mkdir(path + "/public/javascripts", function() {
					utilities.mkdir(path + "/public/javascripts/vendor");
					utilities.mkdir(path + "/public/javascripts/src", function() {
						utilities.mkdir(path + "/public/javascripts/src/backoffice", function() {
							utilities.mkdir(path + "/public/javascripts/src/backoffice/page-scripts");
							complete();
						});
						utilities.mkdir(path + "/public/javascripts/src/main", function() {
							utilities.mkdir(path + "/public/javascripts/src/main/page-scripts");
							complete();
						});
					});
				});
				utilities.mkdir(path + "/public/stylesheets", function() {
					utilities.mkdir(path + "/public/stylesheets/src", function() {
						utilities.mkdir(path + "/public/stylesheets/vendor");
						utilities.mkdir(path + "/public/stylesheets/src/backoffice", function() {
							utilities.copyTemplate("styles/backoffice_base.scss", path + "/public/stylesheets/src/backoffice/backoffice.scss");
							utilities.mkdir(path + "/public/stylesheets/src/backoffice/pages", function() {
								utilities.copyTemplate("styles/login.scss", path + "/public/stylesheets/src/backoffice/pages/_login.scss");
								utilities.copyTemplate("styles/pages_index.scss", path + "/public/stylesheets/src/backoffice/pages/_index.scss");
								complete();
							});
						});
						utilities.mkdir(path + "/public/stylesheets/src/main", function() {
							utilities.copyTemplate("styles/main_base.scss", path + "/public/stylesheets/src/main/main.scss");
							complete();
						});
					});
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateLogsDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		try {
			utilities.mkdir(path + "/logs", function() {
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateModelsDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		try {
			utilities.mkdir(path + "/models", function() {
				let adminTemplate = utilities.loadTemplate("models/admin.js");
				adminTemplate.locals.modelName = "admin";
				adminTemplate.locals.tableName = "admins";
				utilities.write(path + "/models/admin.js", adminTemplate.render());
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateEnvDirectory = function(path, postgresUser, postgresPassword, databaseName) {
	return new Promise(function(resolve, reject) {
		try {
			utilities.mkdir(path + "/env", function() {
				utilities.mkdir(path + "/env/dev", function() {
					let devEnv = utilities.loadTemplate("env/dev");
					devEnv.locals.postgresUser = postgresUser;
					devEnv.locals.postgresPassword = postgresPassword;
					devEnv.locals.databaseName = databaseName;
					utilities.write(path + "/env/dev/.env", devEnv.render());
					resolve();
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateMigrationsDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		try {
			utilities.mkdir(path + "/migrations", function() {
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

const generateConfigDirectory = function(path) {
	return new Promise(function(resolve, reject) {
		try {
			utilities.mkdir(path + "/config", function() {
				utilities.copyTemplate("config/bookshelf.js", path + "/config/bookshelf.js");
				utilities.copyTemplate("config/log.js", path + "/config/log.js");
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};
