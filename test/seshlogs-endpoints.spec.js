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

  //test for GET skatelogs endpoint
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

  //test for GET skatelogs by id endpoint
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
  // test for the POST and DELETE
  describe(`POST /skatelogs`, () => {
    it(`creates a skatesesh, responding with a 201 and a new skatelog`, function () {
      this.retries(3);
      const newSkatelog = {
        board: 'Test new skatelog',
        notes: 'Test new sesh notes...',
      };

      return supertest(app)
        .post('/skatelogs')
        .send(newSkatelog)
        .expect(201)
        .expect(res => {
          expect(res.body.board).to.eql(newSkatelog.board);
          expect(res.body.notes).to.eql(newSkatelog.notes);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/skatelogs/${res.body.id}`);
          const expected = Date().toLocaleString();
          const actual = Date(res.body.date_published).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then(res =>
          supertest(app)
            .get(`/skatelogs/${res.body.id}`)
            .expect(res.body)
        );
    });
  });

  describe.only(`DELETE /skatelogs/:sesh_id`, () => {
    context('Given there are skatelogs in the database', () => {
      const testSkatelog = makeSeshLogsArray();

      beforeEach('insert skatelogs', () => {
        return db
          .into('skatesesh')
          .insert(testSkatelog);
      });

      it('responds with 204 and removes the skatelog', () => {
        const idToRemove = 2;
        const expectedSkatelog = testSkatelog.filter(skatelog => skatelog.id !== idToRemove);
        return supertest(app)
          .delete(`/skatelogs/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/skatelogs`)
              .expect(expectedSkatelog)
          );
      });
    });

  });
});