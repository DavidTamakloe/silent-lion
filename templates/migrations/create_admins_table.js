//eslint-disable-next-line
exports.up = function(knex, Promise) {
	return knex.schema.createTable("admins", function(table) {
		table.increments().primary();
		table.string("first_name");
		table.string("last_name");
		table.string("other_names");
		table.string("email").unique().notNullable();
		table.string("access_level");
		table.string("password");
		table.timestamps(false, true);
	});
};

//eslint-disable-next-line
exports.down = function(knex, Promise) {
	return knex.schema.dropTable("admins");
};
