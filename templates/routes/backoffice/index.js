/**
* /routes/backoffice/index.js
*
* @description:: Index file for the api mini-application. All routes with "/backoffice"
* come through here.
*
*/

const BackofficeRouter = require("express").Router();
const policies = require("./policies");

/* Uncomment this function to create the first superuser. Comment it out Afterwards */
// BackofficeRouter.post("/admin/create", require("./create-admin.js"));

// Put route handlers here
BackofficeRouter.get("/", function(req, res) {
	return res.redirect("/backoffice/home");
});
BackofficeRouter.route("/login").get(require("./show-login-page.js")).post(require("./login.js"));
BackofficeRouter.get("/logout", policies.isLoggedIn, require("./logout.js"));
BackofficeRouter.get("/home", policies.isLoggedIn, require("./show-home-page.js"));

module.exports = BackofficeRouter;
