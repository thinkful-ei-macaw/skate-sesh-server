const LogService = {
  getAllSkateLogs(knex) {
    return knex.from('skatesesh').select('*');

  }
};


module.exports = LogService;