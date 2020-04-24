const AccountsService = {
  getAllAccounts(knex) {
    return knex.select('*').from('accounts');
  },

  insertAccount(knex, newAccount) {
    return knex
      .insert(newAccount)
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

  deleteAccount(knex, id) {
    return knex('account')
      .where({ id })
      .delete();
  },

  updateAccount(knex, id, newAccountFields) {
    return knex('account')
      .where({ id })
      .update(newAccountFields);
  },
};

module.exports = AccountsService;