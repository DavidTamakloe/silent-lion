const dbService = require("../../services/db-service");
const bcrypt = require("bcrypt");

module.exports = async function(req, res, next) {
	try {
		let email = req.body.email;
		let password = req.body.password;
		if (!email || !password) {
			req.flash("error", "Email and password required");
			return res.redirect("back");
		}
		let foundAdmin = await dbService.admin.findByEmail(email);
		if (!foundAdmin) {
			req.flash("error", "invalid email or password");
			return res.redirect("/backoffice/login");
		}
		if (bcrypt.compareSync(password, foundAdmin.get("password"))) {
			req.session.adminId = foundAdmin.get("id");
			return res.redirect("/backoffice/home");
		} else {
			req.flash("error", "invalid email or password");
			return res.redirect("/backoffice/login");
		}
	} catch (err) {
		return next(err);
	}
};
