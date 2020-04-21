/* eslint-disable quotes */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const LogService = require('./log-service');

const app = express();
const jsonParser = express.json();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// gets all skatelogs end point
app.get('/skatelogs', (req, res, next) => {
  const knexInstace = req.app.get('db');
  LogService.getAllSkateLogs(knexInstace)
    .then(skatelogs => {
      res.json(skatelogs);
    })
    .catch(next);
});

// gets skatelogs by sesh id end point
app.get('/skatelogs/:sesh_id', (req, res, next) => {
  const knexInstace = req.app.get('db');
  LogService.getLogsById(knexInstace, req.params.sesh_id)
    .then(skatelogs => {
      if (!skatelogs) {
        return res.status(404).json({
          error: { message: `Skatesesh log doesn't exist` }
        });
      }
      res.json(skatelogs);
    })
    .catch(next);
});
// POST endpoint 
app.post('/skatelogs', jsonParser, (req, res, next) => {
  const newSkatelog = { board, notes }

});


app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  }
  else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;