CREATE TABLE skatesesh (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  board TEXT Not NULL,
  notes TEXT,
  date_skated TIMESTAMPTZ DEFAULT now() NOT NULL
);