module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("booking", {
        plotNumber: {
            type: Sequelize.INTEGER
        },
        client_name : {
            type: Sequelize.STRING
        },
        email : {
            type: Sequelize.STRING
        },
        mobile :{
            type: Sequelize.STRING(25)
        },
        aadharcardNumber : {
            type: Sequelize.STRING
        },
        aadharcardDoc: { 
            type: Sequelize.STRING
        },
        salarySlipDoc: {
            type: Sequelize.STRING
        },
        agreementDoc: {
            type: Sequelize.STRING
        },
        plotAmount: {
            type: Sequelize.FLOAT
        },
        bookingAmount : {
            type: Sequelize.FLOAT(11)
        },
        bookingDate : {
            type: Sequelize.DATE
        },
        paymentMode : {
            type : Sequelize.STRING
        },
        description :{
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        userId :{
            type: Sequelize.INTEGER
        }
    });
  
    return Booking;
};