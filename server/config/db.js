const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  console.log('[Database] MONGODB_URI present:', Boolean(uri));
  console.log('[Database] Using MongoDB Atlas:', uri?.startsWith('mongodb+srv://'));

  try {
    if (!uri) {
      throw new Error('MONGODB_URI is missing from environment variables');
    }

    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;