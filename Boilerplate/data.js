var MongoClient = require('mongodb').MongoClient,
 settings = require('./config.js'),
 Guid = require('Guid');
 bcrypt = require("bcrypt-nodejs");
 
var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
    .then(function(db) {
        var myCollection = db.collection("users");        
		
		//create new user
		exports.createUser = function(email, username, password1, confirmPassword, secQues, secAns) {
			
            if (!email) return Promise.reject("Email Id  is Missing!");
			if(!username) {
				return Promise.reject("User Name is missing");
			}

            if (!password1)
				return Promise.reject("Password is Missing!");
			else if(password1.length < 6 )
				return Promise.reject("Password is too short! Minimum 6 characters.");

			if(!confirmPassword) return Promise.reject("Confirm password field is missing!");

			if(!((password1) === (confirmPassword) ))
				return Promise.reject("Password is not matching with confirm password.");

			if(!secQues) return Promise.reject("Security Question is Missing!");
			if(!secAns) return Promise.reject("Answer for Security Question is Missing!");

			//check if the email id already exists
			return myCollection.find({ email: email }).limit(1).toArray().then(function(listOfUserEmails) {
				if (listOfUserEmails.length !== 0) return Promise.reject("Email Id already exists! Try with a different name.");

				//check if the username already exists
				return myCollection.find({ username: username }).limit(1).toArray().then(function(listOfUsernames) {
					if (listOfUsernames.length !== 0) return Promise.reject("Username already exists! Try with a different name.");

					//insert the details into users collection
					return myCollection.insertOne({ _id: Guid.create().toString(),
						email: email,
						hashedPassword: bcrypt.hashSync(password1),
						profile:{
							username: username,
							secQues: secQues,
							secAns : secAns
						}
					}).then(function(newDoc) {
						return newDoc.insertedId;
					});
				});

			});


        };
		
		//authenticate user by a username and password
		exports.authenticateUser = function(email, password) {
            if (!email) return Promise.reject("Email Id is Missing!");
            if (!password) return Promise.reject("Password is Missing!");			
			
			return myCollection.find({ email: email }).limit(1).toArray().then(function(userObj) {
				
                if (userObj.length === 0) return Promise.reject("No such user exists!");
				return new Promise( function (resolve, reject) {
					bcrypt.compare(password, userObj[0].hashedPassword, function(err, res) {
						if (res === true) {
							resolve(res);
						} else {
							return reject("Login failed!");
						}
					});
				});				
            }); 
        };
		
		//update user with session id
		exports.updateUserWithSessionId = function(email, session_id) {
			if (!email) return Promise.reject("Username is Missing!");
            if (!session_id) 
				return Promise.reject("Session Id is Missing!");
			
			return myCollection.updateOne({ email: email}, {'$set' : {sessionId : session_id}}).then(function() {
				return exports.getUser(email);
			});
			
		};
		
		//edit profile of an existing user
		exports.saveProfile = function(id ,security, Answer) {

            if (!id) return Promise.reject("User Id is Missing!");
			if (!security){
				return Promise.reject("Security Question filed  is Missing!");
			}
			if (!Answer) return Promise.reject("Answer field  is Missing!");

			return myCollection.find({ _id: id }).limit(1).toArray().then(function(listOfUsers) {
				if (listOfUsers.length === 0) return Promise.reject("Could not find user with session_id of " + session_id);
				var obj = listOfUsers[0];
				
				return myCollection.updateOne({ _id : id}, {'$set' :
				{profile : {
					username: listOfUsers[0].profile.username ,
					secQues: security,
					secAns: Answer}}}).then(function() {
					
					return exports.getUserById(id);
				});
			});
		};
		
		//get user by email
		exports.getUser = function(email) {
            if (!email) return Promise.reject("Email is Missing!");

            // by calling .toArray() on the function, we convert the Mongo Cursor to a promise where you can 
            // easily iterate like a normal array
            return myCollection.find({ email: email }).limit(1).toArray().then(function(listOfUsers) {
                if (listOfUsers.length === 0) return Promise.reject("Could not find user with name of " + email);

                return listOfUsers[0];
            });
        };
		
		
		//get user by id
		exports.getUserById = function(id) {
            if (!id) return Promise.reject("User Id is Missing!");

            // by calling .toArray() on the function, we convert the Mongo Cursor to a promise where you can 
            // easily iterate like a normal array
            return myCollection.find({ _id: id }).limit(1).toArray().then(function(listOfUsers) {
                if (listOfUsers.length === 0) return Promise.reject("Could not find user with id of " + id);
				
				//user found
                return listOfUsers[0];
            });
        };
		
		//get user by session id
		exports.getUserBySessionId = function(session_id) {
            if (!session_id) 
				return Promise.reject("Session Id is Missing!");
			
            return myCollection.find({ sessionId: session_id }).limit(1).toArray().then(function(listOfUsers) {
                if (listOfUsers.length === 0) return Promise.reject("Could not find user with session_id of " + session_id);

                return listOfUsers[0];
            });			
		};
		
		//remove session id
		exports.removeSessionId = function(session_id) {
            if (!session_id) 
				return Promise.reject("Session Id is Missing!");
			
            return myCollection.updateOne({ sessionId: session_id}, {'$unset' : {sessionId : ""}}).then(function() {
                
              return true;
            });
			
		};

		
		//Add friend
		exports.addFriend = function(user, friendUserDetails) {
			if(!user)
				return Promise.reject("User Details are missing");
			if(!friendUserDetails)
				return Promise.reject("Friend Details are missing");
			
			return myCollection.find({_id: user._id, 'contact._id': friendUserDetails._id }).limit(1).toArray().then(function(listOfFriends) {
				if (listOfFriends.length !== 0){
					//Friend exists
					return Promise.reject(friendUserDetails.email + " already exists in your friends list!");
				}
				else {
					//Friend doesn't exist, adding now
					return myCollection.updateOne({_id: user._id}, {'$push' : {contact: {_id: friendUserDetails._id, email: friendUserDetails.email, name: friendUserDetails.profile.username}}}).then(function() {
						
						//friend added one way
						return myCollection.updateOne({_id: friendUserDetails._id}, {'$push' : {contact: {_id: user._id, email: user.email, name: user.profile.username}}}).then( function() {
							//friend added 2nd way - mutually adding friends
							return exports.getUserById(user._id); 
						});
					});
				}
			});
		};
		
		
		//remove friend
		exports.removeFriend = function(user, friendUserDetails) {
			if(!user)
				return Promise.reject("User Details are missing");
			if(!friendUserDetails)
				return Promise.reject("Friend Details are missing");
			
			return myCollection.find({_id: user._id, 'contact._id': friendUserDetails._id }).limit(1).toArray().then(function(listOfFriends) {
				if (listOfFriends.length === 0){
					//Friend does not exist
					return Promise.reject(friendUserDetails.email + " doesn't exist in your friends list!");
				}
				else {
					//Friend exists, will remove now
					return myCollection.updateOne({_id: user._id}, {'$pull' : {contact: {_id: friendUserDetails._id, email: friendUserDetails.email, name: friendUserDetails.profile.username}}}).then(function() {
						
						//Friend removed 1st way
						return myCollection.updateOne({_id: friendUserDetails._id}, {'$pull' : {contact: {_id: user._id, email: user.email, name: user.profile.username}}}).then( function() {
							
							//Friend removed 2nd way - mutually removing friends
							return exports.getUserById(user._id); 
						});
					});
				}
			});
		};
		
		//reset password
		exports.updatePasswordByEmail = function(email, newPassword, confirmnewpassword) {
			if (!email)
				return Promise.reject("email is Missing!");	
			
			if (!newPassword)
				return Promise.reject(" New Password is Missing!");
			
			if(newPassword.length < 6 )
				return Promise.reject("Password is too short! Minimum 6 characters.");

			if(!confirmnewpassword) 
				return Promise.reject("Confirm new password field is missing!");

			if(!(newPassword === confirmnewpassword ))
				return Promise.reject("Passwords do not match");
			
			
			//encrypt and update password
			return myCollection.updateOne({ email: email}, {'$set' : {"hashedPassword" : bcrypt.hashSync(newPassword)}}).then(function() {
                
              return true;
            });


		}
		
    });
