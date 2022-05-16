const db = require("../models/index");
const Plots = db.plots;
const Townships = db.townships;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');

// Create and Save a new Township
const create = (req, res) => {
	// Validate request
	if(!(_.isEmpty(req.body))){
		var PlotPostData = req.body;
			// Save Township to Database
			console.log(PlotPostData); 
				var ImageFileName = uploadImage(req.body).then((image)=>{
				_.assign(PlotPostData,{ 'documents': image });
			});
			Plots.create(PlotPostData).then(plot => {
				res.send({ status :1, data:[], message: "Plot was registered successfully!" });
			})
			.catch(err => {
			res.status(500).send({ status :0, data :[], message: err.message });
			});
	}else{
		res.send({ status :0, data :[], message: "Post data is not valid." });
	}
};

// Get all plots 
const getAll = (req, res) => {
	const orConditions = [];
	const paramObj = { include: [Townships] };
	if(req.query.id){
		const id = req.query.id; 
		var townshipCondition = id ? { id: { [Op.eq]: id } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.townshipId){
		const townshipId = req.query.townshipId; 
		var townshipCondition = townshipId ? { townshipId: { [Op.eq]: `${townshipId}` } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.plot_number){
		const plot_number = req.query.plot_number;
		var plot_numberCondition = plot_number ? { plot_number: { [Op.eq]: `${plot_number}` } } : null;
		orConditions.push(plot_numberCondition);
	}
	if(req.query.plot_status){
		const plot_status = req.query.plot_status;
		var plot_statusCondition = plot_status ? { plot_status: { [Op.eq]: `${plot_status}` } } : null;
		orConditions.push(plot_statusCondition);
	}
	if(req.query.status){
		const status = req.query.status;
		var statusCondition = status ? { status: { [Op.eq]: `${status}` } } : null;
		orConditions.push(statusCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.and]: orConditions };
	}
	console.log(paramObj);
	Plots.findAll(paramObj).then(data => {
		res.send({ status :1, data:data, message: "" });
	  })
	  .catch(err => {
		res.status(500).send({ 
			statu :0,
			data:[],
		  	message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
};

/* This function is used to upload image.. */
const uploadImage = async (req, res, next) => {
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

module.exports = {
    create,
    getAll
};