module.exports = function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			console.log(err);
		}
		return res.redirect("/backoffice/login");
	});
};
