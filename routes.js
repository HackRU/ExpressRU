const express = require("express");
const router = express.Router();

let sayHelloController = require("./controllers/HelloWorld.js");

router.get("/", sayHelloController.sayHello);

// add routes here, then write logic in controllers (follow format above)

module.exports = router;
