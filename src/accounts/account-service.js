const AccountsService = {
  getAllAccounts(knex) {
    return knex.from('account').select('*');
  },

  insertAccount(knex, newAccount) {
    return knex
      .insert(newAccount)
      .into('account')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex
      .from('account')
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