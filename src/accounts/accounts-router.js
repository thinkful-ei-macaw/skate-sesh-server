/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const xss = require('xss');
const AccountsService = require('./account-service');

const accountsRouter = express.Router();
const jsonParser = express.json();

const serializeAccount = account => ({
  id: account.id,
  full_name: xss(account.full_name),
  user_name: xss(account.user_name),
  user_password: xss(account.user_password),
  date_created: account.date_created,
});

accountsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    AccountsService.getAllAccounts(knexInstance)
      .then(accounts => {
        res.json(accounts.map(serializeAccount));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { full_name, user_name, user_password } = req.body;
    const newAccount = { full_name, user_name, user_password };

    for (const [key, value] of Object.entries(newAccount)) {
      if (value === null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    newAccount.full_name = full_name;
    newAccount.user_name = user_name;
    newAccount.user_password = user_password;

    AccountsService.insertAccount(
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
    const { full_name, user_name, user_password } = req.body;
    const accountToUpdate = { full_name, user_name, user_password };

    const numberOfValues = Object.values(accountToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname'accountname', or 'password' `
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
