var ejs = require("ejs");
var fs = require("fs");
var mkdirp = require("mkdirp");
var path = require("path");
var readline = require("readline");
var util = require("util");

var MODE_0666 = parseInt("0666", 8);
var MODE_0755 = parseInt("0755", 8);

/**
 * Install an around function; AOP.
 */

function around(obj, method, fn) {
	var old = obj[method];

	obj[method] = function() {
		var args = new Array(arguments.length);
		for (var i = 0; i < args.length; i++) args[i] = arguments[i];
		return fn.call(this, old, args);
	};
}

/**
 * Install a before function; AOP.
 */

function before(obj, method, fn) {
	var old = obj[method];

	obj[method] = function() {
		fn.call(this);
		old.apply(this, arguments);
	};
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */
function confirm(msg) {
	return new Promise(function(resolve, reject) {
		try {
			var rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			rl.question(msg, function(input) {
				rl.close();
				resolve(/^y|yes|ok|true$/i.test(input));
			});
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Copy file from template directory.
 */

function copyTemplate(from, to) {
	from = path.join(__dirname, "templates", from);
	write(to, fs.readFileSync(from, "utf-8"));
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName(destinationPath) {
	let pathName = path.resolve(destinationPath);
	return path.basename(pathName).replace(/[^A-Za-z0-9.()!~*'-]+/g, "-").replace(/^[-_.]+|-+$/g, "").toLowerCase();
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path) {
	return new Promise(function(resolve, reject) {
		fs.readdir(path, function(err, files) {
			if (err && err.code !== "ENOENT") reject(err);
			resolve(!files || !files.length);
		});
	});
}

/**
 * Graceful exit for async STDIO
 */

function getNewExit() {
	var _exit = process.exit;

	function exit(code) {
		// flush output for Node.js Windows pipe bug
		// https://github.com/joyent/node/issues/6247 is just one bug example
		// https://github.com/visionmedia/mocha/issues/333 has a good discussion
		function done() {
			if (!draining--) _exit(code);
		}

		var draining = 0;
		var streams = [process.stdout, process.stderr];

		exit.exited = true;

		streams.forEach(function(stream) {
			// submit empty write request and wait for completion
			draining += 1;
			stream.write("", done);
		});

		done();
	}

	return exit;
}

/**
 * Get user's answer to a question
 */

function getUserInput(questionString) {
	return new Promise(function(resolve, reject) {
		try {
			let rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			rl.question(questionString, function(answer) {
				rl.close();
				resolve(answer);
			});
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd() {
	return process.platform === "win32" && process.env._ === undefined;
}

/**
 * Load template file.
 */

function loadTemplate(name) {
	var contents = fs.readFileSync(path.join(__dirname, "templates", name + ".ejs"), "utf-8");
	var locals = Object.create(null);

	function render() {
		return ejs.render(contents, locals);
	}

	return {
		locals: locals,
		render: render
	};
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
	mkdirp(path, MODE_0755, function(err) {
		if (err) throw err;
		console.log("   \x1b[36mcreate\x1b[0m : " + path);
		fn && fn();
	});
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption(originalName, newName) {
	return function(val) {
		warning(util.format("option `%s' has been renamed to `%s'", originalName, newName));
		return val;
	};
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning(message) {
	console.error();
	message.split("\n").forEach(function(line) {
		console.error("  warning: %s", line);
	});
	console.error();
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str, mode) {
	fs.writeFileSync(path, str, { mode: mode || MODE_0666 });
	console.log("   \x1b[36mcreate\x1b[0m : " + path);
}

module.exports = {
	around: around,
	before: before,
	confirm: confirm,
	copyTemplate: copyTemplate,
	createAppName: createAppName,
	emptyDirectory: emptyDirectory,
	getNewExit: getNewExit,
	getUserInput: getUserInput,
	launchedFromCmd: launchedFromCmd,
	loadTemplate: loadTemplate,
	mkdir: mkdir,
	renamedOption: renamedOption,
	warning: warning,
	write: write,
	constants: {
		MODE_0666: MODE_0666,
		MODE_0755: MODE_0755
	}
};
