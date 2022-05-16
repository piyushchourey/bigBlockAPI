const booking = require("../controllers/booking.controller.js");
const { authJwt, commonServices, verifySignUp } = require("../middlewares");

var router = require("express").Router();

router.post("/create", [ authJwt.verifyToken, commonServices.plotVerify, verifySignUp.isExistUser  ], booking.create);
// router.get("/getAll",[ authJwt.verifyToken ], townships.getAll);

module.exports = router; 