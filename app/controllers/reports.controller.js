const db = require("../models/index");
const Booking = db.booking;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const Townships = db.townships;
const Blocks = db.blocks;
const Plots = db.plots;
const Brokers = db.broker;
const Sequelize = require("sequelize");

const getReport = async (req, res) => {
    console.log(req.query);
	const orConditions = [];
	const paramObj = {};
	if(req.query.townshipId){
		const townshipId = req.query.townshipId; 
		var townshipCondition = townshipId ? { townshipId: { [Op.eq]: `%${townshipId}%` } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.blockId){
		const blockId = req.query.blockId;
		var blockIdCondition = blockId ? { blockId: { [Op.eq]: `%${blockId}%` } } : null;
		orConditions.push(blockIdCondition);
	}
	if(req.query.plotId){
		const plotId = req.query.plotId;
		var plotIdCondition = plotId ? { plotId: { [Op.eq]: `%${plotId}%` } } : null;
		orConditions.push(plotIdCondition);
	}
	if(req.query.status){
		const status = req.query.status;
		var statusCondition = status ? { status: { [Op.eq]: `%${status}%` } } : null;
		orConditions.push(statusCondition);
	}
	if(req.query.userId){
		const userId = req.query.userId;
		var userIdCondition = userId ? { userId: { [Op.eq]: `%${userId}%` } } : null;
		orConditions.push(userIdCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.or]: orConditions };
	}

	//paramObj.include = [Townships,Blocks,Plots,Brokers];
	//let reportData = await Booking.findAll(paramObj)
    if(req.query.filteredBy == "townships"){
        paramObj.include =  [{model: Townships, attributes:['township_name']}];
        paramObj.group = ['booking.townshipId'];
    }
    if(req.query.filteredBy == "blocks"){
        paramObj.include =  [{model: Blocks, attributes:['name']}];
        paramObj.group = ['booking.blockId'];
    }
    if(req.query.filteredBy == "plots"){
        paramObj.include =  [{model: Plots, attributes:['plot_number']}];
        paramObj.group = ['booking.plotId'];
    }
    if(req.query.filteredBy == "brokers"){
        paramObj.include =  [{model: Brokers, attributes:['first_name','last_name','mobile_number']}];
        paramObj.group = ['booking.brokerId'];
    }

    Booking.findAll({
        attributes:[
            [ Sequelize.fn('SUM', Sequelize.col('bookingAmount')), 'bookingAmount'],
            [ Sequelize.fn('SUM', Sequelize.col('plotAmount')), 'plotAmount'],
            [ Sequelize.fn('SUM', Sequelize.col('commission_amount')), 'commission_amount'],
            [ Sequelize.fn('SUM', Sequelize.col('remainingAmount')), 'remainingAmount'],
        ],
        include: paramObj.include,
        group:  paramObj.group
        }).then(result =>res.send({ status:1, data:result, message: '' }))
};

module.exports = {
    getReport
};