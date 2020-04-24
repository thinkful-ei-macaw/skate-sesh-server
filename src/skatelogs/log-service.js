const LogService = {
  getAllSkateLogs(knex) {
    return knex.from('skatesesh_log').select('*');
  },
  insertSkatelogs(knex, newSkatelog) {
    return knex
      .insert(newSkatelog)
      .into('skatesesh_log')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getLogsById(knex, id) {
    return (knex).from('skatesesh_log').select('*').where('id', id).first();
  },
  deleteSkatelogs(knex, id) {
    return knex('skatesesh_log')
      .where({ id })
      .delete();
  },
  updateSkatelogs(knex, id, newSkatelogField) {
    return knex('skatesesh_log')
      .where({ id })
      .update(newSkatelogField);
  }

};


module.exports = LogService;