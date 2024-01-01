const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // config just in case you need

// for each route, write a separate controller file. don't put everything into 1 file
// follow this format 
exports.sayHello = (req, res, next) => {
    res.send("Hello World!");
};