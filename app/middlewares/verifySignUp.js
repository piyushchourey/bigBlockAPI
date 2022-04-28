const db = require("../models");
const Login = db.login;
checkDuplicateEmail = (req, res, next) => {
  // Email
  Login.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    console.log("fyfhggg"+user);
    if (user) {
      res.status(400).send({
        message: "Failed! Email is already in use!"
      });
      return;
    }else{
      next();
    }
  });
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail
};
module.exports = verifySignUp; 