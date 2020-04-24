const AccountService = {
  getAllUsers(knex) {
    return knex.select('*').from('accounts');
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('accounts')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex
      .from('accounts')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteUser(knex, id) {
    return knex('account')
      .where({ id })
      .delete();
  },

  updateUser(knex, id, newUserFields) {
    return knex('account')
      .where({ id })
      .update(newUserFields);
  },
};

module.exports = AccountService;