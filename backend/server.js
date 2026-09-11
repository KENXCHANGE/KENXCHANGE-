require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Basic security
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS - allow GitHub Pages origin + localhost for development
const allowedOrigins = [
  'https://kenxchange.github.io',
  'https://kenxchange.github.io',
  'https://kenxchange.github.io/KENXCHANGE-/',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
app.use(cors({ origin: function(origin, callback){
  if(!origin) return callback(null, true); // allow non-browser/curl
  if(allowedOrigins.indexOf(origin) !== -1){
    callback(null, true);
  } else {
    callback(null, false);
  }
}}));

app.use(rateLimit({ windowMs: 1000 * 60, max: 200 }));

// Health
app.get('/api/health', (req,res)=>res.json({ok:true, time: new Date().toISOString()}));

// Auth - login
app.post('/api/login', async (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({error:'username and password required'});
  try{
    const result = await db.query('SELECT id, username, password_hash, role FROM users WHERE username=$1', [username]);
    if(result.rows.length===0) return res.status(401).json({error:'invalid credentials'});
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if(!match) return res.status(401).json({error:'invalid credentials'});
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, expiresIn: 4*3600 });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Middleware to protect routes
function authenticate(req,res,next){
  const auth = req.headers['authorization'];
  if(!auth) return res.status(401).json({error:'missing authorization header'});
  const parts = auth.split(' ');
  if(parts.length!==2 || parts[0] !== 'Bearer') return res.status(401).json({error:'invalid authorization header'});
  const token = parts[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({error:'invalid token'});
  }
}

// Operations endpoints
app.get('/api/operations', authenticate, async (req,res)=>{
  try{
    const q = await db.query('SELECT id, "user", from_currency, to_currency, amount, rate, date, status FROM operations ORDER BY id DESC');
    res.json(q.rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'server error'});
  }
});

app.get('/api/operations/:id', authenticate, async (req,res)=>{
  const id = req.params.id;
  try{
    const q = await db.query('SELECT id, "user", from_currency, to_currency, amount, rate, date, status FROM operations WHERE id=$1', [id]);
    if(q.rows.length===0) return res.status(404).json({error:'not found'});
    res.json(q.rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'server error'});
  }
});

app.put('/api/operations/:id/status', authenticate, async (req,res)=>{
  const id = req.params.id;
  const { status } = req.body;
  if(!['pending','completed','cancelled'].includes(status)) return res.status(400).json({error:'invalid status'});
  try{
    const q = await db.query('UPDATE operations SET status=$1 WHERE id=$2 RETURNING id, "user", from_currency, to_currency, amount, rate, date, status', [status, id]);
    if(q.rows.length===0) return res.status(404).json({error:'not found'});
    res.json(q.rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'server error'});
  }
});

// Dev-only route to seed data (protected by a simple env token query param)
app.post('/api/seed', async (req,res)=>{
  const token = req.query.token || '';
  if(token !== process.env.SEED_TOKEN) return res.status(403).json({error:'forbidden'});
  try{
    const seed = require('./seed');
    await seed();
    res.json({ok:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:'seed failed'});
  }
});

// Start
app.listen(PORT, ()=>{
  console.log('API listening on port', PORT);
});
