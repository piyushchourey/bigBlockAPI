const db = require("../models/index");
const Townships = db.townships;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const plots = db.plots;

// Create and Save a new Township
const create = (req, res) => {
    // Validate request
    if(!(_.isEmpty(req.body))){
		var townshipPostData = req.body;
		  // Save Township to Database
		  console.log(townshipPostData); 
		  	var ImageFileName = uploadImage(req.body).then((image)=>{
				_.assign(townshipPostData,{ 'documents': image });
			});
		  	Townships.create(townshipPostData).then(township => {
				res.send({ status:1, data:[], message: "Township was registered successfully!" });
			})
		  .catch(err => {
			res.status(500).send({ status:0, data:[], message: err.message });
		  });
    }else{
    	res.send({ status:0, data:[], message: 'Post data is not valid.' });
    }
};

// Get all townships
const getAll = (req, res) => {
	const orConditions = [];
	const paramObj = {};
	if(req.query.id){
		const id = req.query.id; 
		var townshipCondition = id ? { id: { [Op.eq]: id } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.township_name){
		const township_name = req.query.township_name; 
		var townshipCondition = township_name ? { township_name: { [Op.like]: `%${township_name}%` } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.state){
		const state = req.query.state;
		var stateCondition = state ? { state: { [Op.like]: `%${state}%` } } : null;
		orConditions.push(stateCondition);
	}
	if(req.query.city){
		const city = req.query.city;
		var cityCondition = city ? { city: { [Op.like]: `%${city}%` } } : null;
		orConditions.push(cityCondition);
	}
	if(req.query.status){
		const status = req.query.status;
		var statusCondition = status ? { status: { [Op.like]: `%${status}%` } } : null;
		orConditions.push(statusCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.or]: orConditions };
	}
	paramObj.include = [plots]
	Townships.findAll(paramObj).then(data => {
		res.send({ status:1, data:data, message: '' });
	  })
	  .catch(err => {
		res.status(500).send({ 
		  status :0,
		  data :[],
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

const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
	Townships.destroy({
		where: { id: id }
	   })
	  .then(data => {
		res.send({ status:1, data:[], message:"Township deleted successfully."});
	  })
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