const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const router = express.Router();
const passport = require('passport');
const { ensureLocallyAuthenticated, ensureGoogleAuthenticated, ensureRole } = require('./util.js');

const sayHelloController = require("./controllers/HelloWorld.js");
const authController = require("./controllers/authController.js");
const create = require("./controllers/create.js");
const stats = require('./controllers/stats.js');
const resume = require('./controllers/resume.js');
const waiver = require("./controllers/waiver.js");

router.get("/", sayHelloController.sayHello);

// local authentication
router.post("/log-in", passport.authenticate('local', {
  failureRedirect: "/error", 
  failureFlash: true,
  successRedirect: "/success"
}));

// google authentication
router.get("/auth/google", authController.authentication);

router.get("/auth/google/callback", authController.authentication_callback);

router.get("/success", ensureLocallyAuthenticated, ensureGoogleAuthenticated, (req, res, next) => {
  res.send("sucessful log-in");
}); 

router.get("/error", (req, res, next) => {
  res.send("error logging in: " + req.flash('error')[0]);
});

router.get('/log-out', authController.log_out);

router.post("/sign-up", ensureLocallyAuthenticated, ensureGoogleAuthenticated, create.create_user);

router.get('/stats',ensureLocallyAuthenticated, ensureGoogleAuthenticated, ensureRole(['hacker']), stats.get_stats);

router.post('/resume', ensureLocallyAuthenticated, ensureGoogleAuthenticated, resume.upload_resume);

router.post('/waiver', ensureLocallyAuthenticated, ensureGoogleAuthenticated, waiver.upload_waiver);


module.exports = router;
