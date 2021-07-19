import pgp from 'pg-promise';

const db = pgp()({
  connectionString: process.env.DATABASE_URL,
  max: 30,
  ssl: {rejectUnauthorized: false},
});

export default db;
