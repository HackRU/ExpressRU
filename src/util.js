const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const AWS = require("aws-sdk");

// get a collection from the DB
let isConnected = false;

async function getCollection(collectionName) {
  const uri = process.env.DEV_MONGO_URI;

  if (!isConnected) {
    try {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB successfully!");
      isConnected = true;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  const Schema = mongoose.Schema;
  const anySchema = new Schema({}, { strict: false });

  // Check if the model already exists to avoid recompilation error
  const Model = mongoose.models[collectionName] || mongoose.model(collectionName, anySchema, collectionName);
  return Model;
}

function ensureLocallyAuthenticated(req, res, next) {
  // if the user is locally authenticated,
  // then move straight to the route handler
  // there is no need for checking Google authentication
  if (req.isAuthenticated()) {
    req.runEnsureGoogleAuthenticated = false;
  } else {
    req.runEnsureGoogleAuthenticated = true;
  }
  return next();
}

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URI
);

async function ensureGoogleAuthenticated(req, res, next) {
  if (req.runEnsureGoogleAuthenticated){
    if (req.session.tokens) {
      const token = req.session.tokens;
      try {
        const ticket = await client.verifyIdToken({
            idToken: token.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // check if the user exists in your database
        email = payload.email;
        const User = await getCollection("users");
        const user = await User.findOne({ email: email });
        if (user) {
          req.user = user;
          return next();
        } else {
          res.status(404).send("Your account was not found in our database.");
        }
      } catch (error) {
          console.error('Token verification error:', error);
          res.status(401).send('Invalid token');
      }
    } else {
      res.status(401).send("Unauthorized. Invalid.")
    }
  } 
  else { // if the user has logged in locally, then there is no need for this middleware
    return next();
  }
}


function ensureRole(roles) {
  return function(req, res, next) {
    for (let u_role of roles) {
      u_role = u_role.toLowerCase();
      if (u_role in req.user.role) {
        if (req.user.role[u_role]) {
          return next();
        } 
      }
      else {
        return res.status(400).send("Bad request. Such roles doesn't exist.");
      }
    }
    return res.status(401).send("Unauthorized to access this endpoint.");
  }
}

const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  AWS_BUCKET_REGION, 
  ACCESS_KEY_ID, 
  SECRET_ACCESS_KEY
});

// create an S3 instance
const S3 = new AWS.S3();

/**
 * Check if a file exists in a specific S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} fileName - The file key in the S3 bucket.
 * @return {boolean} - True if the file exists, false otherwise.
 */
async function checkFileExists_s3Bucket(bucketName, fileName) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    await S3.headObject(params).promise();
    return true;
  } catch (err) {
    if (err.code === 'NotFound') {
      return false;
    }
    throw err; // Re-throw the error if it is not a 'NotFound' error
  }
}

/**
 * Upload a file to an S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} fileKey - The key for the file in the S3 bucket.
 * @param {string} buffer - The buffer of the file. (in req.file)
 * @param {string} mimeType - The type of the file. (also in req.file)
 */
async function uploadBufferToS3(bucketName, fileKey, buffer, mimeType) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: mimeType
  };

  try {
    const data = await S3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
  } catch (err) {
    throw new Error(`Error uploading file: ${err.message}`);
  }
}


module.exports = {getCollection, ensureGoogleAuthenticated, ensureLocallyAuthenticated, ensureRole, 
                  checkFileExists_s3Bucket, uploadBufferToS3}