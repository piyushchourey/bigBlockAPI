const plots = require("../controllers/plots.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/create", [ authJwt.verifyToken, commonServices.checkDuplicatePlotWithTownship ], plots.create);
router.get("/getAll",[ authJwt.verifyToken ], plots.getAll);

module.exports = router; 