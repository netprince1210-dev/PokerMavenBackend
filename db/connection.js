const mongoose = require('mongoose');
const config = require('../config');

const con = async () => {
  try {
    mongoose.set('strictQuery', false);
    const connectDB = await mongoose.connect(config.db.url);
    console.log(`Database connected: ${connectDB.connection.host}`.cyan.underline);
  }
  catch (error) {
      console.log(error);
      process.exit(1);
  }
}

module.exports = con;
