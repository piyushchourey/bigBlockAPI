module.exports = (sequelize, Sequelize) => {
    const Plots = sequelize.define("plots", {
        plot_number : {
            type: Sequelize.INTEGER
        },
        dimesion : {
            type: Sequelize.STRING
        },
        plot_status: {
            type: Sequelize.STRING
        },
        latitude : {
            type: Sequelize.FLOAT(11)
        },
        longitude : {
            type: Sequelize.FLOAT(11)
        },
        documents : {
            type: Sequelize.STRING
        },
        selling_amount : {
            type: Sequelize.FLOAT(11)
        },
        commission_type :{
           type: Sequelize.TEXT
        },
        agent_commission : {
            type: Sequelize.FLOAT(11)
        },
        description :{
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN
        }
    });
  
    return Plots;
};