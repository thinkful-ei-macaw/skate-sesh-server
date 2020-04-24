TRUNCATE skatesesh_log, account RESTART IDENTITY CASCADE;

ALTER TABLE IF EXISTS skatesesh_log
  DROP COLUMN user_name;

DROP TABLE IF EXISTS skatesesh_log;
DROP TABLE IF EXISTS account;


CREATE TABLE account (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  full_name TEXT,
  user_name TEXT NOT NULL,
  user_password TEXT NOT NULL
);

CREATE TABLE skatesesh_log (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  board TEXT NOT NULL,
  notes TEXT,
  date_skated TIMESTAMPTZ DEFAULT now() NOT NULL,
  account INTEGER REFERENCES account(id) NOT NULL
);