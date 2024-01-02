require("dotenv").config();

const mongoose = require("mongoose");

// get a collection from the DB
async function getCollection(collectionName) {
  const uri = process.env.DEV_MONGO_URI; 
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");

    const collection = mongoose.connection.collection(collectionName);
    return collection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrowing the error is important for handling it later
  }
}

// Usage example:
getCollection("users")
  .then((collection) => {
    // Return the promise from findOne
    return collection.findOne();
  })
  .then((data) => {
    // Handle the data from findOne
    console.log(data);
  })
  .catch((error) => {
    // Handle any errors that occurred in the previous steps
    console.error("Failed to get collection or document:", error);
  });

