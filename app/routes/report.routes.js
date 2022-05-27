const report = require("../controllers/reports.controller.js");
const { verifySignUp, authJwt} = require("../middlewares");

var router = require("express").Router();

router.get("/getAll", [ authJwt.verifyToken ], report.getReport);
router.get("/getDashboardWidgetData", [ authJwt.verifyToken ], report.getDashboardWidgetData);

module.exports = router;
