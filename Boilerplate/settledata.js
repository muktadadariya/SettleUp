var MongoClient = require('mongodb').MongoClient,
 settings = require('./config.js'),
 Guid = require('Guid');
 
var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
    .then(function(db) {

        var mySettleCollection = db.collection("settle");
		
		//find and update amount to be settled
		exports.updateAmountToBeSettled = function(payerId, receiverId, amountShare) {

            if(!payerId) 
				return Promise.reject("paidById is Missing!");
			if(!receiverId)
				return Promise.reject("receiverId is Missing!")
			if (!amountShare) 
				return Promise.reject("amountShare is Missing!");
		
			
			return mySettleCollection.find({ payerId: payerId, receiverId: receiverId}).limit(1).toArray().then(function(listOfEntries) {
				
                if (listOfEntries.length === 0) 
				{
					//else part, swap and check
					return mySettleCollection.find({payerId: receiverId, receiverId: payerId}).limit(1).toArray().then(function(secondList){
						if(secondList.length === 0)
							return Promise.reject("Could not find settle entry with payerid of " + receiverId + "receiver id of " + payerId);
						
						//subtract the settle amount
						return mySettleCollection.updateOne({_id: secondList[0]._id}, { '$set' : {settledOut: secondList[0].settledOut - amountShare}}).then(function(){
							//Settle Entry Updated
						});
			   
					});
				}
               
			   else{
				  
				  //add the settle amount
				   return mySettleCollection.updateOne({_id: listOfEntries[0]._id}, { '$set' : {settledOut: listOfEntries[0].settledOut +  amountShare}}).then(function(){
					   //Settle Entry Updated
				   });
			   }
			   
			}); 
            
        };

		
		//removing the entry from settle, first step to remove any friend
		exports.removeSettleEntry = function(payerId, receiverId) {
			
			
            if(!payerId) 
				return Promise.reject("paidById is Missing!");
			if(!receiverId)
				return Promise.reject("receiverId is Missing!")
			
			return mySettleCollection.find({ payerId: payerId, receiverId: receiverId}).limit(1).toArray().then(function(listOfEntries) {
				
                if (listOfEntries.length === 0) 
				{
					//else part, swap and check
					return mySettleCollection.find({payerId: receiverId, receiverId: payerId}).limit(1).toArray().then(function(secondList){
						if(secondList.length === 0)
							return Promise.reject("Could not find settle entry with payerid of " + receiverId + "receiver id of " + payerId);
						
						if(secondList[0].settledOut != 0.00) {
							//cannot be removed, as amount between them is not settled up
							return Promise.reject("Friend cannot be removed, settlements are pending!");
						}
						return mySettleCollection.remove({payerId: receiverId, receiverId: payerId}).then(function(){
							
							return true;
						});
			   
					});
				}
               
			   else{
					if(listOfEntries[0].settledOut != 0.00)
					{
						//cannot be removed, as amount between them is not settled up
						return Promise.reject("Friend cannot be removed, settlements are pending!");
					}
					return mySettleCollection.remove({payerId: receiverId, receiverId: payerId}).then(function(){
					  
					   return true;
				   });
			   }
			   
			}); 
            
        };


		//get settle details by payer id
		exports.getSettledByPayerID = function(payerId) {
			
			if(!payerId) 
				return Promise.reject("Payer ID is missing");
			
			return mySettleCollection.find({payerId: payerId }).toArray().then(function(listOfEntries) {
				if(listOfEntries.length !== 0)
					return listOfEntries;
				else
					return null;
			});
		};
		
		//get settle details by receiver id
		exports.getSettledByReceiverID = function(receiverID) {
			
			if(!receiverID) 
				return Promise.reject("Receiver ID is missing");
					
			return mySettleCollection.find({receiverId: receiverID }).toArray().then(function(listOfEntries) {
				if(listOfEntries.length !== 0)
					return listOfEntries;
				else
					return null;
			});
		};
		
		//last step in adding friend - add a settle entry between them with 0.00 as amount
		exports.addSettleDetails = function(userId, friendId) {
						
			if (!userId)
				return Promise.reject("User Id is Missing!");
			if(!friendId)
				return Promise.reject("friendId is Missing!");
			
			return mySettleCollection.insertOne({ _id: Guid.create().toString(),
						payerId: friendId,
						receiverId: userId,
						settledOut: 0.00
					}).then(function(newDoc) {
						return newDoc.insertedId;
					});
		};
		

		//get settle details between the users
		exports.getSettleDetails = function(receiverId, payerId) {
			
			if(!receiverId)
				return Promise.reject("receiverId is Missing!");
			if(!payerId)
				return Promise.reject("payerId is Missing!");
			
			return mySettleCollection.find({receiverId: receiverId, payerId: payerId}).limit(1).toArray().then(function(settleDocs) {
				if(settleDocs.length === 0)
					return Promise.reject("No corresponding entry found in Settle table");
				else
					return settleDocs[0];
				
			});

		};
		
});
