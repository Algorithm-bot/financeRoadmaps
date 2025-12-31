import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://sahil:qwerty123@wikipedia.dajnn.mongodb.net/finance?appName=wikipedia';
const dbName = 'finance';

let client: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB Atlas
 */
async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  cachedDb = client.db(dbName);
  return cachedDb;
}

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<Db> {
  return await connectToDatabase();
}

/**
 * Close the database connection
 */
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    cachedDb = null;
  }
}
