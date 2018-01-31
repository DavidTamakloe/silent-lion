/**
* routes/index.js
*
* @description:: index file for routes. This file is like a central station where
* all routes come before they are directed to the respective "mini-application".
*
*/

module.exports = function(app) {
	app.get("/", function(req, res, next) {
		res.render(
			"website/index",
			{
				errors: req.flash("error"),
				success: req.flash("success"),
				info: req.flash("info")
			},
			function(err, html) {
				if (err) {
					next(err);
				}
				return res.send(html);
			}
		);
	});

	app.use("/main", require("./main"));
	app.use("/backoffice", require("./backoffice"));
	app.use("/api", require("./api"));
};
