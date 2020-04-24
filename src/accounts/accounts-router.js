/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const xss = require('xss');
const AccountsService = require('./account-service');

const accountsRouter = express.Router();
const jsonParser = express.json();

const serializeAccount = account => ({
  id: account.id,
  fullname: xss(account.fullname),
  accountname: xss(account.accountname),
  date_created: account.date_created,
});

accountsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    AccountsService.getAllaccounts(knexInstance)
      .then(accounts => {
        res.json(accounts.map(serializeAccount));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { fullname, username, password } = req.body;
    const newAccount = { fullname, username };

    for (const [key, value] of Object.entries(newAccount)) {
      if (value === null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    newAccount.username = username;
    newAccount.password = password;

    AccountsService.insertAccountnewAccount(
      req.app.get('db'),
      newAccount
    )
      .then(account => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${account.id}`))
          .json(serializeAccount(account));
      })
      .catch(next);
  });

accountsRouter
  .route('/:account_id')
  .all((req, res, next) => {
    AccountsService.getById(
      req.app.get('db'),
      req.params.account_id
    )
      .then(account => {
        if (!account) {
          return res.status(404).json({
            error: { message: `account doesn't exist` }
          });
        }
        res.account = account;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeAccount(res.account));
  })
  .delete((req, res, next) => {
    AccountsService.deleteAccount(
      req.app.get('db'),
      req.params.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { fullname, username, password } = req.body;
    const accountToUpdate = { fullname, username, password };

    const numberOfValues = Object.values(accountToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname'accountname', or  'password' `
        }
      });

    AccountsService.updateAccount(
      req.app.get('db'),
      req.params.user_id,
      accountToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = accountsRouter;
