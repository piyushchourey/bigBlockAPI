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
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.or]: orConditions };
	}

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
			'description',
            [ Sequelize.fn('SUM', Sequelize.col('bookingAmount')), 'bookingAmount'],
            [ Sequelize.fn('SUM', Sequelize.col('plotAmount')), 'plotAmount'],
            [ Sequelize.fn('SUM', Sequelize.col('commission_amount')), 'commission_amount'],
            [ Sequelize.fn('SUM', Sequelize.col('remainingAmount')), 'remainingAmount'],
        ],
        include: paramObj.include,
        group:  paramObj.group
        }).then(result =>res.send({ status:1, data:result, message: '' }))
};

const getDashboardWidgetData = async (req, res) => {
	let responseObj = {};
	try{
		let townshipsData = await Townships.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_townships = townshipsData;

		/** Total brokers **/
		let brokersData = await Brokers.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_brokers = brokersData;

		/** Total Plots **/
		let plotsData = await Plots.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_plots = plotsData;

		/** Total Bookings **/
		let bookingData = await Booking.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_bookings = bookingData;

		res.send({ status:1, data:responseObj, message: '' });

	}catch(err){
		res.send({ status:0, data:[], message: err.message })
	}
};
 
const getDashboardReportChart = async (req, res) =>{
	const response = { data:[], label:'Booking', lable:[]};
	try{
		/** Total Plots **/
		let plotsData = await Booking.findAll({
			attributes:[
				[ Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'Year'],
				[ Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'Month'],
				[ Sequelize.fn('MONTHNAME', Sequelize.col('createdAt')), 'MonthName'],
				[ Sequelize.fn('Count', Sequelize.col('id')), 'total_booking']
			],
			group : ['Month','Year']
		});

		//data = _.pick(plotsData.dataValues,'total_booking');

		console.log(plotsData);
		plotsData = JSON.parse(JSON.stringify(plotsData))
		const promises1 =  plotsData.map(async (f) => {
			console.log(f.total_booking);
			response.data.push(f.total_booking);
			response.lable.push(f.MonthName);
			return response;
		 })
		let newArray = await Promise.all(promises1);
		res.send({ status:1, data:newArray, message: '' });

	}catch(err){
		res.send({ status:0, data:[], message: err.message })
	}
}

module.exports = {
    getReport,
	getDashboardWidgetData,
	getDashboardReportChart
};