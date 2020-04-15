const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Skatelogs Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('skatesesh').truncate());

  context('Given there are skatelogs in the database', () => {
    const testSkatelogs = [
      {
        id: 1,
        board: 'first test post!',
        notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ',
        date_skated: '2100-05-22T16:28:32.615Z',
      },
      {
        id: 2,
        board: 'second test post!',
        notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ',
        date_skated: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 3,
        board: 'third test post!',
        notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ',
        date_skated: '2100-05-22T16:28:32.615Z'
      },
      {
        id: 4,
        board: 'fourth test post!',
        notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ',
        date_skated: '1919-12-22T16:28:32.615Z',
      },
    ];

    beforeEach('insert skatesesh', () => {
      return db
        .into('skatesesh')
        .insert(testSkatelogs);
    });
    //supertest to make request to our exress instances get /skatelogs handler
    it('GET /skatelogs responds with 200 and all of the articles', () => {
      return supertest(app)
        .get('/skatelogs')
        .expect(200);
      // TODO: add more assertions about the body
    });
  });

});