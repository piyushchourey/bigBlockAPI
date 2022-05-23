const db = require("../models/index");
const Townships = db.townships;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const Blocks = db.blocks;

// Create and Save a new Township
const create = async (req, res) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var townshipPostData = req.body;
			var ImageFileName = await uploadImage(req.body)
			townshipPostData['documents']= ImageFileName; 
			Townships.create(townshipPostData).then(township => {
					res.send({ status:1, data:[], message: "Township was registered successfully!" });
			}).catch(err => {
					res.status(500).send({ status:0, data:[], message: err.message });
			});
		}else{
			res.send({ status:0, data:[], message: 'Post data is not valid.' });
		}
	}catch(err){
		res.status(500).send({ status:0, data:[], message: err.message });
	}
};

// Get all townships
const getAll = async (req, res) => {
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
	paramObj.include = [Blocks]
	try{
		let userData = await Townships.findAll(paramObj)
		const promises1 =  userData.map(async (f) => {
			f.documents =  process.env.API_URL+'images/'+f.documents;
			return f;
		 })
		let newArray = await Promise.all(promises1);
		res.send({ status:1, data:newArray, message: '' });
	}catch(err){
		res.status(500).send({
			status :0,
			data : [],
			message:
			  err.message || "Some error occurred while retrieving tutorials."
		  });
	}
};

const doUpdate = async (req,res,next) =>{
	console.log(req.body);
	let UpdateTownshipDataExceptID = _.omit(req.body, ['id','township_name','documents']);
	let UpdateTownshipDataOfID = _.pick(req.body, ['id']);
	try{
		const townshipExistData = await Townships.findByPk(UpdateTownshipDataOfID.id);
		if(townshipExistData){
			let matches = (UpdateTownshipDataExceptID.documents).match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
			if (matches.length === 3) {
				var ImageFileName = await uploadImage(UpdateTownshipDataExceptID)
				UpdateTownshipDataExceptID['documents']= ImageFileName; 
			}
			await Townships.update(UpdateTownshipDataExceptID,{
				where : { id : UpdateTownshipDataOfID.id } 
			}).then(data => {
					res.send({ status:1, data:data, message: 'Township updated successfully.' });
			}).catch(err => { 
				res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
			});
		}else{
			res.status(500).send({ status :0, data :[], message: "This township is not exist in our DB." }); 
		}
		
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
	}
}

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
	doRemove,
	doUpdate
};