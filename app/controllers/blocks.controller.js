const db = require("../models/index");
const Blocks = db.blocks;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const Townships = db.townships;

// Create and Save a new Township
const create = async (req, res) => {
    // Validate request
    //let blockData = [{ townshipId: 1, name: "Block- A", size: "10 * 40 " },{ townshipId: 1, name: "Block- B", size: "10 * 40 " },{ townshipId: 1, name: "Block- C", size: "10 * 40 " }];
    try{
		if(!(_.isEmpty(req.body))){
			var blockPostData = req.body;
			Blocks.bulkCreate(blockPostData).then(block => {
					res.send({ status:1, data:[], message: "Block was registered successfully!" });
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

// Get all blocks of township
const getAll = (req, res) => {
	const orConditions = [];
	const paramObj = {};
	if(req.query.id){
		const id = req.query.id; 
		var blockCondition = id ? { id: { [Op.eq]: id } } : null;
		orConditions.push(blockCondition);
	}
	if(req.query.name){
		const name = req.query.name; 
		var blockCondition = name ? { name: { [Op.like]: `%${name}%` } } : null;
		orConditions.push(blockCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.or]: orConditions };
	}
	paramObj.include = [Townships]
    try{
        Blocks.findAll(paramObj).then(data => {
            res.send({ status:1, data:data, message: '' });
          })
          .catch(err => {
            res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." });
          });
    }catch(err){
        res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." });
    }
};


const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
    try{
        Blocks.destroy({ where: { id: id } }).then(data => {
            res.send({ status:1, data:[], message:"Block deleted successfully."});
          }).catch(err => {
            res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
        });
    }catch(err){
        res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
    }
};

module.exports = {
    create,
    getAll,
	doRemove
};