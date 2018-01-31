const dbService = require("../../services/db-service");
const bcrypt = require("bcrypt");

module.exports = async function(req, res) {
	try {
		const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
		let savedAdmin = await dbService.admin.create({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			other_names: req.body.other_names,
			email: req.body.email,
			password: hashedPassword
		});
		return res.send(savedAdmin);
	} catch (err) {
		console.log(err);
		res.status(500);
		return res.send({ error: err });
	}
};
