const isLoggedIn = function(req, res, next) {
	if (req.session.adminId) {
		next();
		return null;
	} else {
		req.flash("info", "Please Login.");
		return res.redirect("/backoffice/login");
	}
};

module.exports = isLoggedIn;
