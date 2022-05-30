const report = require("../controllers/reports.controller.js");
const { verifySignUp, authJwt} = require("../middlewares");

var router = require("express").Router();

router.get("/getAll", [ authJwt.verifyToken ], report.getReport);
router.get("/getDashboardWidgetData", [ authJwt.verifyToken ], report.getDashboardWidgetData);
router.get("/getDashboardReportChart", [ authJwt.verifyToken ], report.getDashboardReportChart);

module.exports = router;