const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
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