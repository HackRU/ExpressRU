const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const moment = require('moment-timezone');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');


const { getCollection } = require('../util.js');

exports.create_user = 
[
    body('email').notEmpty().isEmail().withMessage("Email is required and must be in email format."),
    body('password').notEmpty().isString().withMessage("Password is required."),
    body('link').isString().optional(),
    body('github').isString().optional(),
    body('major').isString().optional(),
    body('short_answer').isString().optional(),
    body('shirt_size').isString().optional(),
    body('first_name').isString().optional(),
    body('last_name').isString().optional(),
    body('dietary_restrictions').isString().optional(),
    body('special_needs').isString().optional(),
    body('date_of_birth').isString().withMessage("DOB must be in string format").optional(),
    body('school').isString().optional(),
    body('grad_year').isString().optional(),
    body('gender').isString().optional(),
    body('level_of_study').isString().optional(),
    body('ethnicity').isString().optional(),
    body('phone_number').isString().optional(),
    async (req, res, next) => {
        // if not within the registration period, cannot sign up
        if (!is_registration_open(process.env.START_DATE, process.env.END_DATE, process.env.TIMEZONE)) {
            return res.status(401).send("Unauthorized to create an account. Today is not within the registration period. ")
        } 
        
        // use epxress-valiator to sanitize request body before making a new account
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } 
        // check to see if a user exists through email
        email = req.body.email;
        const Users = await getCollection('users');
        const usr = await Users.findOne({email:email});
        if (usr) {
            return res.status(400).send("User with this email already exists.");
        }
        
        // hasing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // set up
        doc = {
            "email": email,
            "role": {
                "hacker": true,
                "volunteer": false,
                "judge": false,
                "sponsor": false,
                "mentor": false,
                "organizer": false,
                "director": false
            },
            "votes": 0,
            "password": hashedPassword, 
            "github": req.body.github || '',
            "major": req.body.major || '',
            "short_answer": req.body.short_answer || '',
            "shirt_size": req.body.shirt_size || '',
            'first_name': req.body.first_name || '',
            "last_name": req.body.last_name || '',
            "dietary_restrictions": req.body.dietary_restrictions || '',
            "special_needs": req.body.special_needs || '',
            "date_of_birth": req.body.date_of_birth || '',
            "school": req.body.school || '',
            "grad_year": req.body.grad_year || '',
            "gender": req.body.gender || '',
            "registration_status": req.body.registration_status || 'unregistered',
            "level_of_study": req.body.level_of_study || '',
            "day_of": {
                "checkIn": false
            }
        }

        // add user to DB
        try {
            const insertion = await Users.insertMany(doc); 
            console.log("Document inserted: " + insertion)
            res.send("Create user successfully. ");           
        } catch(e) {
            res.status(500).send(e);
        }
    }
]

function is_registration_open(startDateStr, endDateStr, timezone){
    // Parse the dates in the specified timezone and set the time to the start of the day
    const startDate = moment.tz(startDateStr, "MM/DD/YYYY", timezone).startOf('day');
    const endDate = moment.tz(endDateStr, "MM/DD/YYYY", timezone).endOf('day');
    const currentDate = moment().tz(timezone).startOf('day');

    // Check if the current date is within the range
    if (currentDate.isSameOrAfter(startDate) && currentDate.isSameOrBefore(endDate)){
        return true;
    } 
    return false;
}
