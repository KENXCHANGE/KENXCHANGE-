-- SQL initialization for KENXCHANGE prototype

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operations (
  id SERIAL PRIMARY KEY,
  "user" TEXT,
  from_currency TEXT,
  to_currency TEXT,
  amount NUMERIC,
  rate NUMERIC,
  date DATE,
  status TEXT CHECK (status IN ('pending','completed','cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
