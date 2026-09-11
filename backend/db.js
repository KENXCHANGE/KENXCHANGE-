// Simple Postgres connection pool
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
if(!connectionString){
  console.error('DATABASE_URL not set in env');
}
const pool = new Pool({ connectionString, ssl: process.env.NODE_ENV==='production' ? {rejectUnauthorized:false} : false });
module.exports = { query: (text, params) => pool.query(text, params), pool };
