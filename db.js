const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/inotebook";

// it's simply connected to monogDB with given URI
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI); // given URI
    console.log('Connected to Mongo Successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

module.exports = connectToMongo;
