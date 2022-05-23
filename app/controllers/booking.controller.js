const db = require("../models/index");
const Booking = db.booking;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const Townships = db.townships;
const Blocks = db.blocks;
const Plots = db.plots;
const Brokers = db.broker;

// Create and Save a new Township
const create = async (req, res) => {
	// Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var bookingPostData = req.body;
			//documents upload functionality..
			var bookingPostFilteredData = {aadharcardDoc :null, salarySlipDoc:null, agreementDoc:null};
			var bookingPostFilteredData1 = _.pick(req.body, _.keys(bookingPostFilteredData));
			// let filename = await uploadImage(bookingPostFilteredData1);
			
			let aadharcarddoc =  sigleUploadImage({documents:bookingPostFilteredData1.aadharcardDoc});
			let salarySlipDoc =  sigleUploadImage({documents:bookingPostFilteredData1.salarySlipDoc});

			let agreementDoc =  sigleUploadImage({documents:bookingPostFilteredData1.agreementDoc});
			let newArray = await Promise.all([aadharcarddoc,salarySlipDoc,agreementDoc]);
			console.log(newArray)
			bookingPostData['aadharcardDoc'] = newArray[0];
			bookingPostData['salarySlipDoc'] = newArray[1];
			bookingPostData['agreementDoc'] = newArray[2];
			// return false;
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

// Get all booking
const getAll = (req, res) => {
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

	paramObj.include = [Townships,Blocks,Plots,Brokers];

	Booking.findAll(paramObj).then(data => {
		res.send({ status:1,data:data, message:""});
	  })
	  .catch(err => {
		res.status(500).send({ 
		  message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
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
			
			// console.log(req, response);
			console.log(Object.keys(req), Object.keys(response) )
			if(Object.keys(req).length == Object.keys(response).length ){
				console.log("final check")
				return response;
			}
		} catch (e) {
			callback(e); 
		}
	});
}

const sigleUploadImage = async (req, res, next) => {
	// to declare some path to store your converted image
	var matches = req.documents.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
	response = {};
	 
	if (matches.length !== 3) {
	return new Error('Invalid input string');
	}
	 
	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');
	let decodedImg = response;
	let imageBuffer = decodedImg.data;
	let type = decodedImg.type;
	let extension = mime.getExtension(type); 
	let randomName = new Date().getTime();
	let fileName = randomName +"." + extension;
	try {
		fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
		return fileName;
	} catch (e) {
		next(e); 
	}
}

const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
	try{}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
	Booking.destroy({ where: { id: id } })
	.then(data => { res.send({ status:1, data:[], message:"Booking Entry deleted successfully."}); })
	 .catch(err => {
		res.status(500).send({
		  status :0,
		  data : [],
		  message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
};

module.exports = {
    create,
    getAll,
	doRemove
};