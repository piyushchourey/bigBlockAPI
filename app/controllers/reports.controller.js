const db = require("../models/index");
const Booking = db.booking;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const Townships = db.townships;
const Blocks = db.blocks;
const Plots = db.plots;
const Brokers = db.broker;
const Sequelize = require("sequelize");
const sequelize = db.sequelize;

const getReport = async (req, res) => {
    console.log(req.query);
    if(req.query.filteredBy == "townships"){
		query = `SELECT township.township_name as township_name, township.total_size_of_township as saleable_area, booking.description, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount, SUM(dimesion) AS areaSold FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id GROUP BY booking.townshipId;`
	}
    if(req.query.filteredBy == "blocks"){
		query = `SELECT township.township_name as township_name, block.name as block_name, block.size as saleable_area, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount, SUM(dimesion) AS areaSold FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN blocks AS block ON booking.blockId = block.id  GROUP BY booking.blockId;`
	}
    if(req.query.filteredBy == "plots"){
		query = `SELECT township.township_name as township_name, plot.plot_number as plot_number, booking.plotAmount as plot_amount, booking.bookingAmount AS bookingAmount, booking.commission_amount AS commission_amount, booking.remainingAmount AS remainingAmount, booking.description as description, plot.dimesion as plot_size, broker.first_name, broker.last_name  FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN brokers as broker ON booking.brokerId = broker.id ORDER BY booking.createdAt;`
    }
    if(req.query.filteredBy == "brokers"){
        query = `SELECT broker.first_name, broker.last_name, COUNT(booking.plotID) as number_of_plot, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount FROM bookings AS booking LEFT OUTER JOIN brokers AS broker ON booking.brokerId = broker.id GROUP BY booking.brokerId;`
	}
    resultData = await sequelize.query(query, { type: Sequelize.SELECT });
	res.send({ status:1, data:resultData, message: '' })
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