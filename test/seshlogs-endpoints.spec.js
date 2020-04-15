const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe.only('Skatelogs Endpoints', function () {
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

  afterEach('cleanup', () => db('skatesesh').truncate());

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
    //test to get all skatelogs
    it('GET /skatelogs responds with 200 and all of the articles', () => {
      return supertest(app)
        .get('/skatelogs')
        .expect(200, testSkatelogs);
    });
    //test to get skatelogs/sesh by Id
    it('GET /skatelogs/:sesh_id responds with 200 and the specified seshlog', () => {
      const skateSeshId = 2;
      const expectedSkateSeshId = testSkatelogs[skateSeshId - 1];
      return supertest(app)
        .get(`/skatelogs/${skateSeshId}`)
        .expect(200, expectedSkateSeshId);
    });
  });

});