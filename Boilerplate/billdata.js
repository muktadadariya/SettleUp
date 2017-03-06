var MongoClient = require('mongodb').MongoClient,
 settings = require('./config.js'),
 Guid = require('Guid');
 
var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
    .then(function(db) {
        var myBillCollection = db.collection("bill");
		
		//create new bill
		exports.createBill = function(description, amount, date, paidby, sharedby) {
            if (!description) return Promise.reject("Description is Missing!");
            if (!amount) 
				return Promise.reject("Amount is Missing!");
			if(!date)
				return Promise.reject("Date is Missing!")
			if (!paidby) 
				return Promise.reject("Payer Id is Missing!");
			if(!sharedby)
				return Promise.reject("Bill participants are missing")
				
			return myBillCollection.insertOne({ _id: Guid.create().toString(), description: description, amount: amount, date: date.toString(), paidby: paidby, sharedby: sharedby }).then(function(newDoc) {
				return newDoc.insertedId;
			});
            
        };
		
		
		//get recent activity
		exports.getRecentActivity = function(userObj) {
            if (!userObj) return Promise.reject("User is Missing!");
			
			//sort by date field in descending order, limit to 10 entries
			return myBillCollection.find({$or: [ {paidby: userObj._id}, {'sharedby._id': userObj._id} ]}).sort({date:-1}).limit(10).toArray();
        };
		
});
