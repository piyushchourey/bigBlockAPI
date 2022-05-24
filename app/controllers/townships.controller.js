const db = require("../models/index");
const Townships = db.townships;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const Blocks = db.blocks;
const XLSX = require("xlsx"); 
const {  commonServices } = require("../middlewares");
var multer  = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// console.log('test123')
	  cb(null, './excel/')
	},
	filename: function (req, file, cb) {
		console.log('filenmeaff')
		let filenqme =  Date.now()+file.originalname
		req['filename2'] = filenqme
	  cb(null, filenqme)
	}
  })
  
  const fileFilter=(req, file, cb)=>{
	console.log("sdsads");
//    if(file.mimetype ==='csv' || file.mimetype ==='xls'){
// 	   cb(null,true);
//    }else{
// 	   cb(null, false);
//    }
  
  }
  
  var upload = multer({ 
	storage:storage
	// limits:{
	// 	fileSize: 1024 * 1024 * 5
	// },
	// fileFilter:fileFilter
  });
  
  const singleFileUpload = upload.single("importFile")

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

const bulkImport = async ( req, res ) =>{
	try{
		console.log(req.files); 
		console.log(__dirname)
		let data = await new Promise((resolve, reject) => {
			console.log('runnn')
			return singleFileUpload(req, res, err => {
				console.log(err) 
				// console.log(res)

			  if (err) return reject(err)
			  return resolve('');
			})
		  })
		  console.log('data',data)
		return res.send({
			state :1,
			data:req['filename2']
		})
		let fileData = req.files.importFile;
		let randomName = new Date().getTime();
		let newpath = 'excel/'+randomName+'_'+fileData.name;
		fs.rename(fileData.name, newpath, async function () {
			const wb = XLSX.readFile(newpath);
			const sheets = wb.SheetNames;
			
			if(sheets.length > 0) {
				const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
				console.log(data);
				const townships = data.map(row => ({
					township_name: row['Township Name'],
					state: row['State'],
					city: row['City'],
					pincode: row['Pincode'],
					number_of_blocks: row['Number of blocks'],
					number_of_plots: row['Number of plots'],
					total_size_of_township: row['Total size of township'],
					colonizer: row['Colonizer'],
					colonizer_status: row['Colony status'],
					description: row['Description'],
					status: 1
				}))
				await Townships.bulkCreate(townships); 
				res.send({ status:1, data:[], message: "Township was registered successfully!" });
			}
		})
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
};

module.exports = {
    create,
    getAll,
	doRemove,
	doUpdate,
	bulkImport
};