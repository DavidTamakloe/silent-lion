module.exports = function(req, res, next) {
	return res.render(
		"backoffice/pages/login.ejs",
		{
			errors: req.flash("error"),
			success: req.flash("success"),
			info: req.flash("info")
		},
		function(err, html) {
			if (err) {
				return next(err);
			}
			return res.send(html);
		}
	);
};
