import knex from 'knex';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'slideshow.sqlite');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

export const setupDatabase = async () => {
  try {
    const tableExists = await db.schema.hasTable('images');
    if (!tableExists) {
      console.log("Creating 'images' table...");
      await db.schema.createTable('images', (table) => {
        table.increments('id').primary();
        table.string('server_id').unique().notNullable();
        table.string('filename').notNullable();
        table.string('local_path').notNullable();
        table.integer('display_order').defaultTo(0);
        table.timestamps(true, true);
      });
      console.log("'images' table created successfully.");
    } else {
      console.log("'images' table already exists.");
    }
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

export const getAllLocalImageServerIds = async () => {
  try {
    const images = await db('images').select('server_id');
    return new Set(images.map(img => img.server_id));
  } catch (error) {
    console.error('Error fetching local image server IDs:', error);
    return new Set();
  }
};

// --- ADD THIS NEW FUNCTION ---
// Gets all image records from the local database
export const getLocalImages = async () => {
  try {
    // We can add sorting by 'display_order' here later
    return await db('images').select('*').orderBy('created_at', 'desc');
  } catch (error) {
    console.error('Error fetching local images:', error);
    return [];
  }
};

export default db;