const admin = require("../controllers/admin.controller.js");
const { verifySignUp } = require("../middlewares");

var router = require("express").Router();

router.post("/register", [ verifySignUp.checkDuplicateEmail ], admin.doRegister);
router.get("/getAll", admin.getAll);

module.exports = router;