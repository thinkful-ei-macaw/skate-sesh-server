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
  describe(`GET /api/skatelogs`, () => {
    context(`Given no skatelogs`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/skatelogs')
          .expect(200, []);
      });
    });

    context('Given there are skatelogs in the database', () => {
      const testSeshLogs = makeSeshLogsArray();

      beforeEach('insert skatelogs', () => {
        return db
          .into('skatesesh')
          .insert(testSeshLogs);
      });

      it('responds with 200 and all of the skatelogs', () => {
        return supertest(app)
          .get('/api/skatelogs')
          .expect(200, testSeshLogs);
      });
    });
  });

  //test for GET skatelogs by id endpoint
  describe(`GET /api/skatelogs/:sesh_id`, () => {
    context(`Given no session id`, () => {
      it(`responds with 404`, () => {
        const sesh_id = 123456;
        return supertest(app)
          .get(`/api/skatelogs/${sesh_id}`)
          .expect(404, { error: { message: `Skatesesh doesn't exist` } });
      });
    });

    context('Given there are skatelogs in the database', () => {
      const testSeshLogs = makeSeshLogsArray();

      beforeEach('insert skatelogs', () => {
        return db
          .into('skatesesh')
          .insert(testSeshLogs);
      });

      it('responds with 200 and the specified article', () => {
        const skateLogId = 2;
        const expectedSkateLogId = testSeshLogs[skateLogId - 1];
        return supertest(app)
          .get(`/api/skatelogs/${skateLogId}`)
          .expect(200, expectedSkateLogId);
      });
    });
  });
  // test for the POST and DELETE
  describe(`POST /api/skatelogs`, () => {
    it(`Creates a Skatesesh, responding with a 201 and a new skatelog`, function () {
      this.retries(3);
      const newSkatelog = {
        board: '',
        notes: '',
      };

      return supertest(app)
        .post('/api/skatelogs')
        .send(newSkatelog)
        .expect(201)
        .expect(res => {
          expect(res.body.board).to.eql(newSkatelog.board);
          expect(res.body.notes).to.eql(newSkatelog.notes);
          expect(res.headers.location).to.eql(`/api/skatelogs/${res.body.id}`);
          const expected = Date().toLocaleString();
          const actual = Date(res.body.date_published).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then(res =>
          supertest(app)
            .get(`/api/skatelogs/${res.body.id}`)
            .expect(res.body)
        );
    });
  });

  describe(`DELETE /api/skatelogs/:sesh_id`, () => {
    context(`Given no skatelogs`, () => {
      it(`responds with 404`, () => {
        const skateSeshId = 123456;
        return supertest(app)
          .delete(`/api/skatelogs/${skateSeshId}`)
          .expect(404, { error: { message: `SkateSesh doesn't exist` } });
      });
    });

    context('Given there are skatelogs in the database', () => {
      const testSeshLogs = makeSeshLogsArray();

      beforeEach('insert skatelogs', () => {
        return db
          .into('skatesesh')
          .insert(testSeshLogs);
      });

      it('responds with 204 and removes the Skatesesh', () => {
        const idToRemove = 2;
        const expectedSeshlog = testSeshLogs.filter(sesh_id => sesh_id.id !== idToRemove);
        return supertest(app)
          .delete(`/api/skatelogs/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/skatelogs/`)
              .expect(expectedSeshlog)
          );
      });
    });

    describe.only(`PATCH /api/skatelogs/:sesh_id`, () => {
      context(`Given no skatelogs`, () => {
        it(`responds with 404`, () => {
          const sesh_Id = 123456;
          return supertest(app)
            .patch(`/api/skatelogs/${sesh_Id}`)
            .expect(404, { error: { message: `Skatelog doesn't exist` } });
        });
      });
    });
    context('Given there are skatelogs in the database', () => {
      const testSeshLogs = makeSeshLogsArray();

      beforeEach('insert seshlog', () => {
        return db
          .into('skatesesh')
          .insert(testSeshLogs);
      });

      it('responds with 204 and updates the skatelog', () => {
        const idToUpdate = 2;
        const updateSeshlog = {
          board: 'updated sesh title',
          notes: 'updated sesh content',
        }
        const expectedSkatelog = {
          ...testSeshLogs[idToUpdate - 1],
          ...updateSeshlog
        }
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send(updateSeshlog)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/skatelogs/${idToUpdate}`)
              .expect(expectedSkatelog)
          )
      });
    });


  });
});