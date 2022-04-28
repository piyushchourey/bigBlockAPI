const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const LoginMeta = sequelize.define("login_meta", {
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      address:{
        type: DataTypes.TEXT
      },
      mobile_number:{
        type: DataTypes.INTEGER
      },
      aadhar_number:{
        type: DataTypes.INTEGER
      },
      documents: {
        type: DataTypes.BLOB
      }
    },{
  hooks: {
      beforeCreate() {
        // Do other stuff
      }
    }
    });
  
    return LoginMeta;
};