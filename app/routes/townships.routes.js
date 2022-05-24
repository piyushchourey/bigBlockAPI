const townships = require("../controllers/townships.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/create", [ authJwt.verifyToken, commonServices.checkDuplicateTownship ], townships.create);
router.get("/getAll",[ authJwt.verifyToken ], townships.getAll);
router.put("/update", [ authJwt.verifyToken ], townships.doUpdate);
router.delete("/remove",[ authJwt.verifyToken ], townships.doRemove);
router.post("/import", townships.bulkImport);

module.exports = router; 

