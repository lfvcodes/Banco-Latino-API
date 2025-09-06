require('dotenv').config();

async function dbConnect() {
  const dbType = process.env.DATABASE_TYPE;
  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME;
  const port = process.env.DATABASE_PORT;

  let client;
  if (dbType === 'mysql') {
    const mysql = require('mysql2/promise');
    client = await mysql.createConnection({ host, user, password, database, port });
  } else if (dbType === 'postgresql') {
    const { Client } = require('pg');
    client = new Client({ host, user, password, database, port });
    await client.connect();
  } else if (dbType === 'sqlserver') {
    const sql = require('mssql');
    await sql.connect({ user, password, server: host, database, port });
    client = sql;
  } else {
    throw new Error('Tipo de base de datos no soportado');
  }
  return client;
}

module.exports = dbConnect;
