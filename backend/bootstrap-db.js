const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not set in environment.');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema & seeds...');
    await client.query(schemaSql);
    console.log('====================================================');
    console.log('Database tables, indexes, security policies, and seed');
    console.log('data have been successfully created on your Supabase!');
    console.log('====================================================');
  } catch (error) {
    console.error('CRITICAL DATABASE INITIALIZATION ERROR:', error.message || error);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
