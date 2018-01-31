/**
 * config/log.js
 *
 * @description:: Config file for logging. sets up logging with winston default logger
 *                to be used in all modules/files.
 *
 */

const fs = require("fs");
const winston = require("winston");

module.exports = function() {
	const logDir = "logs";
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir);
	}
	const tsFormat = () => new Date().toLocaleString();

	winston.remove(winston.transports.Console); //remove console transport so we can add it where we want.
	if (process.env.NODE_ENV !== "test") {
		winston.add(winston.transports.Console, {
			timestamp: tsFormat,
			colorize: true,
			level: process.env.NODE_ENV === "production" ? "info" : "silly"
		});
		winston.add(require("winston-daily-rotate-file"), {
			filename: `${logDir}/-transcript.log`,
			timestamp: tsFormat,
			datePattern: "yyyy-MM-dd",
			prepend: true,
			level: "info"
		});
	}

	return winston;
};
