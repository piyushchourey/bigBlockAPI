const db = require("../models/index");
const Booking = db.booking;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');

// Create and Save a new Township
const create = async (req, res) => {
	// Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var bookingPostData = req.body;
			//documents upload functionality..
			var bookingPostFilteredData = {aadharcardDoc :null, salarySlipDoc:null, agreementDoc:null};
			var bookingPostFilteredData1 = _.pick(req.body, _.keys(bookingPostFilteredData));
			await uploadImage(bookingPostFilteredData1).then(imageUploadArr => {
				console.log(imageUploadArr)
			})
			console.log(uploadDocObj);
			Booking.create(bookingPostData).then(bookingData => {
				res.send({ status:1, data:[], message: "Plot booked successfully!" });
			}).catch(err => {
				res.status(500).send({ status:0, data:[], message: err.message });
			});
		}else{
			res.send({ status:0, data:[], message:  "Post data is not valid."});
		}
	}catch(err){
		res.status(500).send({ status:0, data:[], message: err.message });
	}
};

// Get all townships
const getAll = (req, res) => {
	// const orConditions = [];
	// const paramObj = {};
	// if(req.query.township_name){
	// 	const township_name = req.query.township_name; 
	// 	var townshipCondition = township_name ? { township_name: { [Op.like]: `%${township_name}%` } } : null;
	// 	orConditions.push(townshipCondition);
	// }
	// if(req.query.state){
	// 	const state = req.query.state;
	// 	var stateCondition = state ? { state: { [Op.like]: `%${state}%` } } : null;
	// 	orConditions.push(stateCondition);
	// }
	// if(req.query.city){
	// 	const city = req.query.city;
	// 	var cityCondition = city ? { city: { [Op.like]: `%${city}%` } } : null;
	// 	orConditions.push(cityCondition);
	// }
	// if(req.query.status){
	// 	const status = req.query.status;
	// 	var statusCondition = status ? { status: { [Op.like]: `%${status}%` } } : null;
	// 	orConditions.push(statusCondition);
	// }
	// console.log(orConditions);
	// if(_.size(orConditions) > 0){
	// 	paramObj.where = { [Op.or]: orConditions };
	// }
	// Townships.findAll(paramObj).then(data => {
	// 	res.send(data);
	//   })
	//   .catch(err => {
	// 	res.status(500).send({ 
	// 	  message:
	// 		err.message || "Some error occurred while retrieving tutorials."
	// 	});
	//   });
};

/* This function is used to upload image.. */
const uploadImage = async (req, res, callback) => {
	// to declare some path to store your converted image
	  var response = {}; 
	_.forEach(req, async function(value, key) {
		// to declare some path to store your converted image
		var matches = req[key].match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}
		let type = matches[1];
		let imageBuffer = new Buffer(matches[2], 'base64');
		let extension = mime.getExtension(type); 
		let randomName = new Date().getTime();
		let fileName = randomName +"." + extension;
		try {
			fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
			response[key] = fileName;
			console.log(req.length);
			if(response.length == req.length){
				return callback(response);
			}
		} catch (e) {
			callback(e); 
		}
	});
}

module.exports = {
    create,
    getAll
};