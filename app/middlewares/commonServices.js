const db = require("../models");
const Townships = db.townships;
const Plots = db.plots;


checkDuplicateTownship = (req, res, next) => {
  // Email
  Townships.findOne({
    where: {
      township_name: req.body.township_name,
      state: req.body.state,
      city: req.body.city
    }
  }).then(township => {
    if (township) {
      res.status(400).send({
        message: "Failed! Township name is already in use with mention state and city!"
      });
      return;
    }else{
      next();
    }
  });
};

checkDuplicatePlotWithTownship = (req, res, next) => {
  // Email
  Plots.findOne({
    where: {
      townshipId: req.body.townshipId,
      plot_number: req.body.plot_number
    }
  }).then(township => {
    if (township) {
      res.status(400).send({
        message: "Failed! This Plot is already in added with township!"
      });
      return;
    }else{
      next();
    }
  });
};

const commonServices = {
  checkDuplicateTownship: checkDuplicateTownship,
  checkDuplicatePlotWithTownship : checkDuplicatePlotWithTownship
};
module.exports = commonServices; 