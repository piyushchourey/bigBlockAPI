const db = require("../models/index");
const Login = db.login;
const LoginMeta = db.LoginMeta;
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
var _ = require('lodash');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');

/* This function is used to resgistered Admin user */
const doRegister = async (req, res) =>{
	if(!(_.isEmpty(req.body))){
		var loginPostFilteredData = {email:null,password:null,role:null};
		var loginPostData = _.pick(req.body, _.keys(loginPostFilteredData));
		_.assign(loginPostData,{ 'password': bcrypt.hashSync(req.body.password, 8) });
		var loginMetaPostData = _.omit(req.body, _.keys(loginPostFilteredData));
		  // Save User to Database
		  //console.log(loginPostData); 
		  Login.create(loginPostData).then(user => {
			_.assign(loginMetaPostData,{ 'loginId': user.id });
			// var ImageFileName =  uploadImage(req.body)
			// .then((image)=>{
				//console.log(image);
				//loginMetaPostData['documents'] = image;
				//_.assign(loginMetaPostData,{ 'documents': image });
				//console.log(ImageFileName)
			//console.log('test123',loginMetaPostData);
			 //res.status(200).send({ status: 1, data: loginMetaPostData, message: "User was registered successfully!" });
		// console.log(loginMetaPostData);
			loginMetaPostData['documents'] = '1652727833289.png';
			// LoginMeta.create(loginMetaPostData).then(() => {
			// 	res.status(200).send({ status: 1, data: [], message: "User was registered successfully!" });
			// }); 
			try {
				let userReg = await LoginMeta.create(loginMetaPostData)
				res.status(200).send({ status: 1, data: [], message: "User was registered successfully!" });	
			} catch (error) {
				res.status(500).send({ status: 0, data: [], message: err.message });
			}
		//});
			
			
		  })
		  .catch(err => {
			res.status(500).send({ status: 0, data: [], message: err.message });
		  });
	}else{
		res.send({ status: 0, data: [], message: "Post data is not valid." });
	}
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

/*This function is used to get all data */
const getAll = (req, res) => {
	const first_name = req.query.first_name;
	var condition = first_name ? { first_name: { [Op.like]: `%${first_name}%` } } : null;
	LoginMeta.findAll({ where: condition, include: [Login] })
	  .then(data => {
		res.send({ status:1,data:data, message:""});
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

const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
	LoginMeta.destroy({
		where: { id: id }
	   })
	  .then(data => {
		res.send({ status:1, data:[], message:"Admin deleted successfully."});
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
  doRegister,
  getAll,
  doRemove
}