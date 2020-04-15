const LogService = {
  getAllSkateLogs(knex) {
    return knex.from('skatesesh').select('*');
  },
  getLogsById(knex, id) {
    return (knex).from('skatesesh').select('*').where('id', id).first();
  }
};


module.exports = LogService;