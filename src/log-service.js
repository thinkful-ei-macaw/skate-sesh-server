const LogService = {
  getAllSkateLogs(knex) {
    return knex.from('skatesesh').select('*');
  },
  insertSkatelog(knex, newSkatelog) {
    return knex
      .insert(newSkatelog)
      .into('skatesesh')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getLogsById(knex, id) {
    return (knex).from('skatesesh').select('*').where('id', id).first();
  },
  deleteShoppingItem(knex, id) {
    return knex('skatesesh')
      .where({ id })
      .delete();
  },
  updateSkatelog(knex, id, newSkatelogField) {
    return knex('skatesesh')
      .where({ id })
      .update(newSkatelogField);
  }

};


module.exports = LogService;