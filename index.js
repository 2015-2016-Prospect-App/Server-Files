var express = require('express');
var app = express();
var requestify = require('requestify');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var ranking = require('./rankingSystemUpdate');

var clientID = "541312567370-pab53eic5cd7s031sclpavu8i65rceub.apps.googleusercontent.com";
var url = 'mongodb://localhost:27017/test';

//testdsdasd
//dgudgas

//make sure token is valid
function validateToken(token){
	requestify.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token).then(function(response) {
		if(response.getBody().aud == clientID){
			return true;
		}else{
			return false;
		}
	});
}
//get id from token
function getId(token){
	requestify.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token).then(function(response) {
		if(response.getBody().aud == clientID){
			return response.getBody().sub;
		}
	});
}


// Adds a user
app.get('/add-user', function (req, res) {
	var token = req.query.id;
	var name = req.query.name;
	assert.equals(validateToken(token),true);
    var id = getId(token);

	function insertDocument(db,callback){
		db.collection("users").insertOne(
			{
				"id": id,
				"name": name,
				"position":{
					"longitude": 0,
					"latitude": 0,
					"lastUpdated": Date.now()
				},
				"mean": 1200,
				"standardDeviation": 400,
				"skillNumber": 880,
				"comments":[
					["0","PLACEHOLDER"]
				],
				"wins":0,
				"games":0,
				"friends":[]
			},
			function(err,result){
				assert.equal(null,err);
				callback(result);
			});
	}

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		insertDocument(db,function(){
			db.close();
		})
	});

});

// Adds name to requester's friend's list
app.get('/add-friend', function (req, res) {
	var token = req.query.id;
	var friendId = req.query.friendId;
	var id = getId(token);
	assert.equals(validateToken(token),true);

	function updateDocuments(db,callback){
		db.collection("users").updateOne(
			{ id: id },
			{ $push: { friends: friendId } },
			function(err,result){
				assert.equal(null,err);
				callback(result);
			});
	}

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		updateDocuments(db,function(){
			db.close();
		})
	});

});

app.get('/user-exists',function(req,res){
	var id = req.query.id;
    var token = req.query.token;
    assert.equals(validateToken(token),true);
    
	MongoClient.connect(url,function(err,db){
		assert.equal(null,err);
		db.collection("users").count({id : id},function(err,count){
			console.log(count);
			if(count<1){
				res.send("false");
			}else{
				res.send("true");
			}
			db.close();
		});

	})
	
});

app.get('/get-user',function(req,res){
	var id = req.query.id;
    var token = req.query.token;
    assert.equals(validateToken(token),true);
    
	MongoClient.connect(url,function(err,db){
		assert.equal(null,err);
		db.collection("users").findOne({id : id}, function(err,docs){
            res.send(docs);
        });
	})
	
});

var server = app.listen(2014, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});