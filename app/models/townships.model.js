module.exports = (sequelize, Sequelize) => {
    const Townships = sequelize.define("townships", {
        township_name : {
            type: Sequelize.STRING
        },
        state : {
            type: Sequelize.STRING
        },
        city : {
            type: Sequelize.STRING
        },
        pincode : {
            type: Sequelize.INTEGER
        },
        number_of_blocks : {
            type: Sequelize.INTEGER
        },
        number_of_plots : {
            type: Sequelize.INTEGER
        },
        total_size_of_township : {
            type: Sequelize.STRING
        }, 
        colonizer : {
            type: Sequelize.STRING
        },
        colonizer_status : {
            type: Sequelize.STRING
        },
        documents : {
            type: Sequelize.STRING
        },
        latitude : {
            type: Sequelize.FLOAT(11)
        },
        longitude : {
            type: Sequelize.FLOAT(11)
        },
        description :{
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN
        }
    });
  
    return Townships;
};