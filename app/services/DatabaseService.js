import pgp from 'pg-promise';
const db = pgp()('postgres://postgres:zxc321@localhost:5432/tom');

export default db;
