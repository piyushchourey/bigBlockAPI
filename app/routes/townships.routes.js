const townships = require("../controllers/townships.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/create", [ authJwt.verifyToken, commonServices.checkDuplicateTownship ], townships.create);
router.get("/getAll",[ authJwt.verifyToken ], townships.getAll);

module.exports = router; 