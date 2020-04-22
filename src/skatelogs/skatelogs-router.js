/* eslint-disable quotes */
const express = require('express');
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
    const { board, notes } = req.body;
    const newSkatelog = { board, notes };

    for (const [key, value] of Object.entries(newSkatelog)) {
      if (value === null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    LogService.insertSkatelog(
      req.app.get('db'),
      newSkatelog
    )
      .then(skatelog => {
        res
          .status(201)
          .location(`/skatelogs/${skatelog.id}`)
          .json(skatelog);
      })
      .catch(next);
  });

skatelogsRouter
  .route('/:sesh_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    LogService.getLogsById(knexInstance, req.params.sesh_id)
      .then(skatelog => {
        if (!skatelog) {
          return res.status(404).json({
            error: { message: `Skatesesh log doesn't exist` }
          });
        }
        res.json(skatelog);
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    LogService.deleteSkatelog(
      req.app.get('db'),
      req.params.sesh_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = skatelogsRouter;