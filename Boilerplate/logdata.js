var MongoClient = require('mongodb').MongoClient,
 settings = require('./config.js'),
 Guid = require('Guid');
 
var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
    .then(function(db) {

        var myLogCollection = db.collection("log");
		
		//create new log entry
		exports.createLogEntry = function(transactionId, paidById, sharedById, amountShare) {
			
            if (!transactionId) 
				return Promise.reject("transactionId is Missing!");
            if (!paidById) 
				return Promise.reject("paidById is Missing!");
			if(!sharedById)
				return Promise.reject("sharedById is Missing!")
			if (!amountShare) 
				return Promise.reject("amountShare is Missing!");
		
			
			return myLogCollection.insertOne({ _id: Guid.create().toString(), transactionId: transactionId, paidById: paidById, sharedById: sharedById, amountShare: amountShare }).then(function(newDoc) {
				return newDoc.insertedId;
			}); 
            
        };
		
});
