require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

module.exports = async function seed(){
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin1234';
  const seedAdmin = async ()=>{
    const hash = await bcrypt.hash(adminPass, 10);
    await db.query('INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3) ON CONFLICT (username) DO NOTHING', ['admin', hash, 'admin']);
  };

  const seedOps = async ()=>{
    const ops = [
      {id:101,user:'alice',from:'USD',to:'EUR',amount:200,rate:0.92,date:'2026-09-01',status:'completed'},
      {id:102,user:'bob',from:'EUR',to:'USDT',amount:150,rate:1.08,date:'2026-09-06',status:'pending'},
      {id:103,user:'charlie',from:'USDT',to:'XOF',amount:300,rate:610,date:'2026-09-08',status:'completed'},
      {id:104,user:'dan',from:'USD',to:'USDT',amount:50,rate:1,date:'2026-09-10',status:'pending'}
    ];
    for(const op of ops){
      await db.query('INSERT INTO operations (id, "user", from_currency, to_currency, amount, rate, date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING', [op.id, op.user, op.from, op.to, op.amount, op.rate, op.date, op.status]);
    }
  };

  await seedAdmin();
  await seedOps();
  console.log('Seed complete. Admin password:', adminPass);
};

// If executed directly
if(require.main === module){
  seed().then(()=>process.exit(0)).catch(err=>{console.error(err);process.exit(1)});
}
