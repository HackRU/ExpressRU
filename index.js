require("dotenv").config()

const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
//const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));

const routes = require("./routes.js")
app.use("/", routes);
  
app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});