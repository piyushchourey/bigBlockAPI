const booking = require("../controllers/booking.controller.js");
const { authJwt, commonServices, verifySignUp } = require("../middlewares");

var router = require("express").Router();

router.post("/register",  booking.create);
// router.get("/getAll",[ authJwt.verifyToken ], townships.getAll);
//[ authJwt.verifyToken, commonServices.plotVerify, verifySignUp.isExistUser  ],
module.exports = router; 