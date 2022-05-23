const booking = require("../controllers/booking.controller.js");
const { authJwt, commonServices, verifySignUp } = require("../middlewares");

var router = require("express").Router();

router.post("/register", [ authJwt.verifyToken ], booking.create);
router.get("/getAll", [ authJwt.verifyToken ], booking.getAll);
router.delete("/remove",[ authJwt.verifyToken ], booking.doRemove);
module.exports = router; 