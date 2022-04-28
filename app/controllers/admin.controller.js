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
const doRegister = (req, res) =>{
	if(!(_.isEmpty(req.body))){
		var loginPostFilteredData = {email:null,password:null,role:null};
		var loginPostData = _.pick(req.body, _.keys(loginPostFilteredData));
		_.assign(loginPostData,{ 'password': bcrypt.hashSync(req.body.password, 8) });
		var loginMetaPostData = _.omit(req.body, _.keys(loginPostFilteredData));
		  // Save User to Database
		  //console.log(loginPostData); 
		  Login.create(loginPostData).then(user => {
			_.assign(loginMetaPostData,{ 'loginId': user.id });
			var ImageFileName = uploadImage(req.body).then((image)=>{
				console.log(image);
				_.assign(loginMetaPostData,{ 'documents': image });
			});
			console.log(loginMetaPostData);
			LoginMeta.create(loginMetaPostData).then(() => {
				res.send({ message: "User was registered successfully!" });
			}); 
		  })
		  .catch(err => {
			res.status(500).send({ message: err.message });
		  });
	}else{
		res.send({"status":200,"msg":"Post data is not valid."});
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
	let fileName = "image." + extension;
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
		res.send(data);
	  })
	  .catch(err => {
		res.status(500).send({
		  message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
};

module.exports = {
  doRegister,
  getAll
}