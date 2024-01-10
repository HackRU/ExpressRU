const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: process.env.PASSPORT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const { getCollection } = require("./util.js");

// configure passport local sign-in
passport.use(new LocalStrategy({usernameField: "email", passwordField: 'password'},
    async (email, password, cb) => {
        //console.log(email);
        const Users = await getCollection('users');
        const usr = await Users.findOne({ email: email });
        //console.log(usr);
        if (!usr) {
            return cb(null, false, { message: "Account not found" });
        }  else {
            try {
                correct_password = usr.password.buffer.toString('utf8');
                bcrypt.compare(password, correct_password,(err, isMatch) => {
                    if (err) {
                        // handle error
                        return cb(err);
                    }
                
                    if (isMatch) {
                        // Passwords match
                        return cb(null, usr);
                    } else {
                        // Passwords do not match
                        return cb(null, false, { message: "Wrong password" });
                    }
                });
            } catch(e) {
                return cb(e);
            }
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
  
passport.deserializeUser(async function(id, done) {
    try {
        const Users = await getCollection('users');
        const usr = await Users.findById(id);
        done(null, usr);
    } catch(err) {
        done(err);
    }
});

const routes = require("./routes.js");
app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(`Listening at http://localhost:${process.env.PORT}`);
});
