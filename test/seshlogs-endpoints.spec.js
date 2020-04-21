/* eslint-disable quotes */
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeSeshLogsArray } = require('./seshlogs.fixtures');

describe('Skatelogs Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  before('clean the table', () => db('skatesesh').truncate());

  afterEach('cleanup', () => db('skatesesh').truncate());

  //test for skatelogs end point
  describe(`GET /skatelogs`, () => {
    context(`Given no skatelogs`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/skatelogs')
          .expect(200, []);
      });
    });

    context('Given there are skatelogs in the database', () => {
      const testskatelogs = makeSeshLogsArray();

      beforeEach('insert skatelogs', () => {
        return db
          .into('skatesesh')
          .insert(testskatelogs);
      });

      it('responds with 200 and all of the skatelogs', () => {
        return supertest(app)
          .get('/skatelogs')
          .expect(200, testskatelogs);
      });
    });
  });

  //test for get skatelogs by id end point
  describe(`GET /skatelogs/:sesh_id`, () => {
    context(`Given no session id`, () => {
      it(`responds with 404`, () => {
        const sesh_id = 123456;
        return supertest(app)
          .get(`/skatelogs/${sesh_id}`)
          .expect(404, { error: { message: `Skatesesh log doesn't exist` } });
      });
    });

    context('Given there are skatelogs in the database', () => {
      const testskatelogs = makeSeshLogsArray();

      beforeEach('insert skatelogs', () => {
        return db
          .into('skatesesh')
          .insert(testskatelogs);
      });

      it('responds with 200 and the specified article', () => {
        const skateLogId = 2;
        const expectedSkateSeshId = testskatelogs[skateLogId - 1];
        return supertest(app)
          .get(`/skatelogs/${skateLogId}`)
          .expect(200, expectedSkateSeshId);
      });
    });
  });

  describe.only(`POST /skatelogs`, () => {
    it(`creates a skatelog, responding with a 201 and a new skatesesh`, function () {
      return supertest(app)
        .post('/skatelogs')
        .send({
          board: 'Test new skatelog',
          notes: 'test new sesh notes...'
        })
        .expect(201);
    });
  });


});


//test that were refactored to include descrive, Below. 
//Will delete before deployment

//   after('disconnect from db', () => db.destroy());

//   before('clean the table', () => db('skatesesh').truncate());

//   afterEach('cleanup', () => db('skatesesh').truncate());

//   context('Given there are skatelogs in the database', () => {
//     const testSkatelogs = makeSeshLogsArray();

//     beforeEach('insert skatesesh', () => {
//       return db
//         .into('skatesesh')
//         .insert(testSkatelogs);
//     });
//     //test to get all skatelogs
//     it('GET /skatelogs responds with 200 and all of the articles', () => {
//       return supertest(app)
//         .get('/skatelogs')
//         .expect(200, testSkatelogs);
//     });
//     //test to get skatelogs/sesh by Id
//     it('GET /skatelogs/:sesh_id responds with 200 and the specified seshlog', () => {
//       const skateSeshId = 2;
//       const expectedSkateSeshId = testSkatelogs[skateSeshId - 1];
//       return supertest(app)
//         .get(`/skatelogs/${skateSeshId}`)
//         .expect(200, expectedSkateSeshId);
//     });
//   });

// });