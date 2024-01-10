const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { getCollection } = require('../util.js');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URI
);
const { google } = require("googleapis"); // Import the googleapis library

exports.authentication = async (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(url);
}

exports.authentication_callback = async (req, res) => {
  const { tokens } = await client.getToken(req.query.code);
  req.session.tokens = tokens;
  client.setCredentials(tokens);

  // Fetch the user's profile information
  const oauth2 = google.oauth2({
    auth: client,
    version: "v2",
  });
  oauth2.userinfo.get(async (err, response) => {
    if (err) {
      // Handle error
      res.status(500).send("Internal server error.");
    } else {
      // response.data is the user profile returned by Google
      console.log(response.data);
    }
  });
  // Redirect user or show a success message
  res.redirect("/success");;
}

exports.log_out = (req, res, next) => {
  req.logout((err) => {
    if (err) {
        // Handle the error case
        console.error('Error during logout:', err);
        return res.status(500).send('Error while logging out');
    }

    // destroy the session
    req.session.destroy((sessionErr) => {
        if (sessionErr) {
            console.error('Session destruction error:', sessionErr);
            return res.status(500).send('Error while logging out');
        }

        res.send("Logged out."); 
    });
});
}