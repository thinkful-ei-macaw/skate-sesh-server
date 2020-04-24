/* eslint-disable quotes */
const express = require('express');
const path = require('express');
const xss = require('xss');
const LogService = require('./log-service');

const skatelogsRouter = express.Router();
const jsonParser = express.json();

skatelogsRouter
  .route('/')
  .get((req, res, next) => {
    LogService.getAllSkateLogs(
      req.app.get('db')
    )
      .then(skatelogs => {
        res.json(skatelogs);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { board, notes, account } = req.body;
    const newSkatelog = { board, notes, account };

    for (const [key, value] of Object.entries(newSkatelog)) {
      if (value === null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    LogService.insertSkatelogs(
      req.app.get('db'),
      newSkatelog
    )
      .then(skatelog => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${skatelog.id}`))
          .json(skatelog);
      })
      .catch(next);
  });

skatelogsRouter
  .route('/:sesh_id')
  .all((req, res, next) => {
    LogService.getLogsById(
      req.app.get('db'),
      req.params.Sesh_id
    )
      .then(skatelog => {
        if (!skatelog) {
          return res.status(404).json({
            error: { message: `Skatelog doesn't exist` }
          });
        }
        res.skatelog = skatelog;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      board: res.skatelog.board,
      notes: xss(res.skatelog.notes),
      account: res.skatelog.account
    });
  })
  .delete((req, res, next) => {
    LogService.deleteSkatelogs(
      req.app.get('db'),
      req.params.sesh_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { board, notes, account } = req.body;
    const seshLogToUpdate = { board, notes, account };

    LogService.updateSkatelogs(
      req.app.get('db'),
      req.params.sesh_id,
      seshLogToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = skatelogsRouter;