// We first require our express package
var express = require('express');
var bodyParser = require('body-parser');
var myData = require('./data.js');
var GuidSession = require('Guid');
var cookieParser = require('cookie-parser');
var myBillData = require('./billdata.js');
var myLogData = require('./logdata.js');
var mySettleData = require('./settledata.js');
var xss = require("xss");

// This package exports the function to create an express instance:
var app = express();

// We can setup ejs now!
app.set('view engine', 'ejs');

// This is called 'adding middleware', or things that will help parse your request
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());


// This middleware will activate for every request we make to 
// any path starting with /assets;
app.use('/assets', express.static('assets'));


//middleware which gets executed for every request made
app.use(function(request, response, next) {
	
	//if session exists for user - logged in user
	if(request.cookies.session_id){		
		myData.getUserBySessionId(request.cookies.session_id).then(function(userObj) {
			//obtained user
			response.locals.user = userObj;	
			
		}, function(errorMessage) {
			// invalidate, then clear so that session_id no longer shows up on the
			// cookie object
			var anHourAgo = new Date();
			anHourAgo.setHours(anHourAgo.getHours() -1);
			response.cookie("session_id", "", { expires: anHourAgo });
			response.clearCookie("session_id");
			
		}).then(function(){
			next();
		});
	}
	else{
		//if session_id doesn't exist - user is not logged in
		response.locals.user = undefined;
		next();
	}
});


//Routes

//home page route
app.get("/",  function (request, response) { 
	
	//if user logged in - navigate to dashboard
	if(response.locals.user){
		response.redirect("/dashboard");
	}
	else{
		//if not logged in - retain on home page
		response.render("pages/form", { error: null, success: null, errorLogin: null } );
		
	}
	
});

//allows the user to signup
app.post("/signup", function (request, response) {

	email = xss(request.body.email);
	uname = xss(request.body.username);
	password1 = xss(request.body.password);
	confirmpassword1 = 	xss(request.body.confirmPassword);
	secQues = xss(request.body.secQues);
	secAns = xss(request.body.secAns);
	
	
	myData.createUser(email, uname, password1, confirmpassword1, secQues, secAns).then(function(userObjId){
		// On success, do:
		response.render("pages/form", {errorLogin:null, error:null, success:"User has successfully signed up. Please login to continue!"});
	}, function(errorMessage) {
		// On error, do:
		response.render("pages/form", {errorLogin:null, error:errorMessage, success:null});
	
    });

});


//allows the user to login
app.post("/login", function (request, response) {
		
	email2 = xss(request.body.email2);
	password2 = xss(request.body.password2);
	
	//user authentication
	myData.authenticateUser(email2, password2).then(function(userObj){

		//if logged in - create a session_id and set a cookie
		
		var session_id = GuidSession.create().toString();
		var expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);
		response.cookie("session_id", session_id, { expires: expiresAt });
		
		//update the user object with current session id
		myData.updateUserWithSessionId(request.body.email2, session_id).then(function(updatedUserObj){
			//Updated user with session_id
		}, function(errorMessage) {
			response.status(500).json({ "error": errorMessage });
		});
		
		//navigate to dashboard
		response.redirect("/dashboard");
		
	}, function(errorMessage) {
		//login failed
		response.render("pages/form", { error: null, success: null, errorLogin: errorMessage} );
	
    });	
	
});

//shows the dashboard page
app.get("/dashboard" , function(request,response){

	//if logged in -- show dashboard	
	if(response.locals.user) {
		
		//local variables to store dashboard data
		var theyOweMeDisplayMetaData = [];
		var iOweOthersDisplayMetaData = [];
		var theyOweMeDisplayData = [];
		var iOweOthersDisplayData = [];
		var recentActivity = [];
		
		
		var getSettledByPayerIDFunc = function() {
			//get all entries in which payer id is same as the id of the logged in user
			mySettleData.getSettledByPayerID(response.locals.user._id).then(function(listOfEntries) {
				
				//if any entries exist
				if(listOfEntries){
					for(var i = 0; i < listOfEntries.length; i++){
						
						//if the settled out amount is less than 0, then I Owe Others
						if(listOfEntries[i].settledOut < 0) {
							
							//get the id of the user and the corresponding amount and push it in array
							iOweOthersDisplayMetaData.push({
								userId : listOfEntries[i].receiverId,
								amount: -(listOfEntries[i].settledOut)
							});
						}
						
						//if the settled out amount is greater than 0, then Others Owe Me
						if (listOfEntries[i].settledOut > 0) { 
							
							//get the id of the user and the corresponding amount and push it in array						
							theyOweMeDisplayMetaData.push({
								userId : listOfEntries[i].receiverId,
								amount: listOfEntries[i].settledOut
							});
						}
					}
				}
				
			}, function(errorMessage){
				console.log("error :  " + errorMessage);
				response.send({error:errorMessage});
			}).then(function(){
				
				//get all entries in which receiver id is same as the id of the logged in user
				mySettleData.getSettledByReceiverID(response.locals.user._id).then(function(listOfEntries) {
					
				//if any entries exist
				if(listOfEntries){
					for(var i = 0; i < listOfEntries.length; i++){
						
						//if the settled out amount is greater than 0, then I Owe Others
						if(listOfEntries[i].settledOut > 0) {
							
							//get the id of the user and the corresponding amount and push it in array
							iOweOthersDisplayMetaData.push({
								userId : listOfEntries[i].payerId,
								amount: listOfEntries[i].settledOut
							});
						}
						
						//if the settled out amount is less than 0, then Others Owe Me
						if (listOfEntries[i].settledOut < 0) { 
							
							//get the id of the user and the corresponding amount and push it in array
							theyOweMeDisplayMetaData.push({
								userId : listOfEntries[i].payerId,
								amount: -(listOfEntries[i].settledOut)
							});
						}
					}
				}
			}, function(errorMessage){
				console.log("error :  " + errorMessage);
				response.send({error:errorMessage});
			}).then(function(){
					var myUserObj = response.locals.user;
					
					//if contacts and I Owe Others exist
					if(myUserObj.contact && iOweOthersDisplayMetaData){
						for(var i = 0; i < myUserObj.contact.length; i++)
						{
							for(var j = 0; j < iOweOthersDisplayMetaData.length; j++)
							{
								if(myUserObj.contact[i]._id == iOweOthersDisplayMetaData[j].userId){
									
									//get the corresponding name of the contact, amount and push it in array
									iOweOthersDisplayData.push({
										userName: myUserObj.contact[i].name,
										amount: iOweOthersDisplayMetaData[j].amount
									});
								}
							}
						}
					}
					
					//if contacts and Others Owe Me exist
					if(myUserObj.contact && theyOweMeDisplayMetaData){
						for(var i = 0; i < myUserObj.contact.length; i++)
						{
							for(var j = 0; j < theyOweMeDisplayMetaData.length; j++)
							{
								//get the corresponding name of the contact, amount and push it in array
								if(myUserObj.contact[i]._id == theyOweMeDisplayMetaData[j].userId){
									theyOweMeDisplayData.push({
										userName: myUserObj.contact[i].name,
										amount: theyOweMeDisplayMetaData[j].amount
									});
								}
							}
						}
					}
					
					//get the recent 10 bills in which logged in user is involved (either as the payer or the participant of bill)
					myBillData.getRecentActivity(response.locals.user).then(function(billEntries) {
						recentActivity = billEntries
																	
					}, function(errorMessage) {
						console.log("Error in getting entries for recent activity: " + errorMessage);
						response.send({error:errorMessage});
					}).then(function(){
						//load dashboard with all the data computed
							response.render("pages/dashboard", {iOweOthersDisplayData: iOweOthersDisplayData, theyOweMeDisplayData: theyOweMeDisplayData, recentActivity: recentActivity, userObjId: response.locals.user._id, userName:response.locals.user.profile.username} );
					
					});
				});
			});		
		};
		
		
		
		var dashboardFunc = function(){
			getSettledByPayerIDFunc();
		};
		
		dashboardFunc();
		
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}


});

//shows the forgot password page when the link is clicked
app.get("/forgotPassword", function(request, response) {

    response.render("pages/forgotpassword", {
        error2: null,
		errorLogin: null
    });

});

//allows the user to proceed after providing email id
app.post("/forgotPassword", function(request, response) {
    var email = xss(request.body.emailFP);
	
	//get user details by providing email id
    myData.getUser(email).then(function(user) {
        response.render('pages/forgotPasswordPart2', {
            user: user,
            error2: null,
			errorLogin: null
        });

    }, function(errorMessage) {
		
		//in case of error
		response.render('pages/forgotPassword', {
            error2: errorMessage,
			errorLogin: null
        });
		
	});
});

//allows the user to provide answer to the security question
app.post("/forgotPasswordPart2", function(request, response) {

    var email = xss(request.body.email);
    var answer = xss(request.body.answer);
	
	//get user details by providing email id
    myData.getUser(email).then(function(user) {
		
		//check if the answer to the security question matches
        if (user.profile.secAns === answer) {
            
            response.render('pages/forgotPasswordPart3', {
                user: user,
				success:null,
                error2: null,
				errorLogin: null
            });


        } else {
			
            // Show error - in case of wrong answer
            response.render('pages/forgotPasswordPart2', {
                user: user,
                error2: "The answer provided is incorrect. Please try again!",
				errorLogin: null
            });

        }

    }, function(errorMessage) {
		
		//error - if user is not found
		response.render('pages/forgotPassword', {
            error2: errorMessage,
			errorLogin: null
        });
		
	});



});

//allows the user to reset password by providing new password
app.post("/forgotPasswordPart3", function(request, response) {

    var newpassword = xss(request.body.newpassword);
    var confirmnewpassword = xss(request.body.confirmnewpassword);
    var email = xss(request.body.email);

	//get user details by providing email id
    myData.getUser(email).then(function(user) {
		
		//if user details exist, update the password
		myData.updatePasswordByEmail(email, newpassword, confirmnewpassword).then(function(userObj){
			 response.render('pages/forgotPasswordPart3', {
                user: user,
				success:"Password reset is successful. Please login to continue.",
                error2: null,
				errorLogin: null
            });
			
		}, function(errorMessage) {
			//in case of error - while updating password
			response.render('pages/forgotPasswordPart3', {
                user: user,
				success:null,
                error2: errorMessage,
				errorLogin: null
            });
			
		});
		
		
    }, function(errorMessage) {
		//error - if user details do not exist
		response.render('pages/forgotPassword', {
            error2: errorMessage,
			errorLogin: null
        });
	});



});

//shows the form which lets the user to edit profile
app.get("/editProfile" , function(request,response){
	
	//if user is logged in
	if(response.locals.user) {
		response.render("pages/edit",{ error: null, success:null , user: response.locals.user, userName:response.locals.user.profile.username} );

	}else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}

});

//allows the user to change profile details
app.post("/editProfile" , function(request , response){

	var secQues = xss(request.body.Security);
	var secAns = xss(request.body.Answer);
	
	//if user is logged in
	if(response.locals.user) {

		//save the user profile with the updated security question and answer
		myData.saveProfile(response.locals.user._id, secQues, secAns).then(function(userObject){
			//update is successful
			response.render("pages/edit",{ error: null, success:"Successfully Updated" , user: userObject, userName:response.locals.user.profile.username} );
		}, function(errorMessage) {
			//in case of error - while updating profile
			response.render("pages/edit", { error: errorMessage, success:null, user: null, userName:response.locals.user.profile.username} );
		});

	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}

});

//shows the form in which friend can be added
app.get("/addfriend", function(request, response) {

	//if user is logged in
	if(response.locals.user){
		myData.getUserBySessionId(request.cookies.session_id).then(function(user) {
			
			//response.locals.friends = user.contact;
			if(request.query.errorMsg) {
				//in case of error 
				response.render("pages/addFriend", { error: null, error2: request.query.errorMsg, successMsg:null, userName:response.locals.user.profile.username, friends:response.locals.user.contact});
			}
			else {
				response.render("pages/addFriend", {error: null, successMsg:null , error2: null, userName:response.locals.user.profile.username, friends:response.locals.user.contact});
			}
		});
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
	

});

//allows the user to add friend
app.post("/addfriend", function(request, response) {

	var friendEmail = xss(request.body.email);
	var uObj;
	
		//if user is logged in
		if(response.locals.user){
			
			//check the existence of the user
			myData.getUser(friendEmail).then(function(friendUserDetails) {
				
				// Add the friend , since the user exists
				myData.addFriend(response.locals.user, friendUserDetails).then(function (userObj) {
					uObj = userObj.contact;
					
				}, function(errorMessage) {
					response.send({error:errorMessage});
					
				}).then( function () {
					
					//friend is added, adding settle entry for the user and friend pair
					mySettleData.addSettleDetails(friendUserDetails._id, response.locals.user._id).then(function(newId) {
							
							//settle entry added, send to ajax
							response.send({friends:uObj, successMsg: "Friend Added"});
						
						}, function(errorMessage) {
							//settle entry couldn't be added, send to ajax
							response.send({error:errorMessage});
							
					});
				});
			}, function(errorMessage) {
				//error message - user does not exist with the email provided
				errorMessage = "This email id is not yet registered! Invite him/her to Settle Up!"
				response.send({error:errorMessage});

			});
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
});

//allows the user to remove friend
app.delete("/removefriend/:email", function(request, response) {

	var friendEmail = request.params.email;
	var email = friendEmail.trim();
	
	//if user is logged in
	if(response.locals.user){
		
		//check the existence of the user
		myData.getUser(email).then(function(friendUserDetails) {
			
			// Check if settle entry can be removed since the user exists
			mySettleData.removeSettleEntry(response.locals.user._id, friendUserDetails._id).then(function() { 
			
				// Remove the friend , since the settle entry between them is removed
				myData.removeFriend(response.locals.user, friendUserDetails).then(function (userObj) {
					
					//friend removed, send to ajax
					response.send({friends:userObj.contact, successMsg: "Friend Removed"});

				}, function(errorMessage) {
					//friend couldn't be removed, send to ajax
					response.send({error:errorMessage});
					
				});
			}, function(errorMessage) {
				//settle entry can't be removed - pending settlements exist between the user
					response.send({error:errorMessage});
					
			});
		}, function(errorMessage) {
			// Send the error message - user does not exist with the email provided
			response.send({error:errorMessage});
			
		});	
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
});	
	

//shows a form in which bill can be added
app.get("/addBill", function (request, response) {
	
	//if user is logged in
	if(response.locals.user){
		response.render("pages/billform", {error: null, myUserObj: response.locals.user, success:null, userName:response.locals.user.profile.username} );
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
	
});

//allows the user to save bill entries and create corresponding settle entries
app.post("/addBill", function (request, response) {
	
	//if user is logged in
	if(response.locals.user){
		var description = xss(request.body.description);
		var amount = parseFloat(xss(request.body.amount));
		var date = xss(request.body.datepicker);
		var paidby = response.locals.user._id;
		var selectedIds = [];
		
		//array to store the bill participants objects 
		var myBillSharedObjs = [];
		
		if(typeof request.body.sharedby === "string")
			selectedIds.push(request.body.sharedby);
		else
			selectedIds = request.body.sharedby;
		

		var addBillFunc = function() {
			getSharedObjectsFunc();
			
			//check if bill is shared with any friends
			if(myBillSharedObjs == null){
				response.render("pages/billform", {error: "Please select the participants..", myUserObj: response.locals.user, success:null, userName:response.locals.user.profile.username} );
			}
			else {
				//if shared, create a bill entry
				createBillFunc();
			}
			return;
		};
		
		
		var getSharedObjectsFunc = function() {  
			
			var userContactObjs = response.locals.user.contact;
			var len = userContactObjs.length;
			
			for(var i in userContactObjs) {
				for(var j in selectedIds) {
					if(userContactObjs[i]._id == selectedIds[j])
					{
						myBillSharedObjs.push(userContactObjs[i]);
					}
				}
			}
			
			for(var j in selectedIds) {
				//if the logged in user is the participant of the bill, push his object to the array too
				if(paidby == selectedIds[j]) {
					var myObj = {
									_id : response.locals.user._id,
									name: response.locals.user.profile.username,
									email: response.locals.user.email
								}
					myBillSharedObjs.push(myObj);
				}
			}
		};
		
		
		
		var createBillFunc = function() {
			myBillData.createBill(description, amount, date, paidby, myBillSharedObjs).then(function(billObjId) {
				
				//bill created, calculate the share of each person
				var amountShared = amount/myBillSharedObjs.length;
				
				for(var i = 0; i < myBillSharedObjs.length; i++) {
					
					//create a log entry for each person's share 
					myLogData.createLogEntry(billObjId, paidby, myBillSharedObjs[i]._id, amountShared).then(function(logObjId) {
						//Log entry created
					}, function(errorMessage) {
						//error in createLogEntry
						response.send({error:errorMessage});
					});
					
				}
				
				for(var j = 0; j < myBillSharedObjs.length; j++){
					
					//excluding the amount share of the paid by user, create settle entry for the rest of the participants
					if(paidby != myBillSharedObjs[j]._id){
						mySettleData.updateAmountToBeSettled(paidby, myBillSharedObjs[j]._id, amountShared).then(function() {
							//Settle entry created 
						}, function(errorMessage) {
							//error in updateAmountToBeSettled
							response.send({error:errorMessage});
						});
					}

				}
				
				response.render("pages/billform", {error: null, myUserObj: response.locals.user, success: "Bill added successfully!", userName:response.locals.user.profile.username} );
				
			}, function(errorMessage) {
				//error in creating a bill
				response.render("pages/billform", {error: errorMessage, myUserObj: response.locals.user, success: null, userName:response.locals.user.profile.username} );
			});
		}
		
		addBillFunc();
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}

});

//shows a form in which user can settle balance 
app.get("/settleBill", function(request, response){
	
	//if logged in
	if(response.locals.user)
	{
		response.render("pages/settleform", {error: null, myUserObj: response.locals.user, success:null, userName:response.locals.user.profile.username});
	}
	else
	{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
});


//allows the user settle balance and save the entries
app.post("/settleBill" , function(request, response){

	//if logged in
	if (response.locals.user) {

		var payerId = response.locals.user._id;
		var receiverId = xss(request.body.settlewith);
		var settledOut = parseFloat(xss(request.body.amountSettle));
		
		//updating the settled amount
		mySettleData.updateAmountToBeSettled(payerId, receiverId, settledOut).then(function ()
		{
			//amount settled
			response.render("pages/settleform", {error: null, myUserObj: response.locals.user, success: "Settle was successful!", userName:response.locals.user.profile.username} );

		}, function (errorMessage)
		{
			//error encountered while settling
			response.render("pages/settleform", {error: errorMessage, myUserObj: response.locals.user, success: null, userName:response.locals.user.profile.username} );

		});
	}
	else
	{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
});

//allows the user to logout
app.post("/logout", function (request, response) {
	
	// expire the user's authentication cookie and wipe the currentSessionId for the currently logged in user
	
	//remove sessionid from db
	if(request.cookies.session_id){
		myData.removeSessionId(request.cookies.session_id).then(function(status) {
			//navigate to home page
			response.redirect("/");
		}, function(errorMessage) {
			//error in removing session id
			response.status(500).json({ "error": errorMessage });
		});
	
		//expire the cookie
		var anHourAgo = new Date();
		anHourAgo.setHours(anHourAgo.getHours() -1);
		// invalidate, then clear so that session_id no longer shows up on the
		// cookie object
		response.cookie("session_id", "", { expires: anHourAgo });
		response.clearCookie("session_id");
		
	}
	else{
		//if not logged in - navigate to home page
		response.redirect("/");
	}
	
});

// We can now navigate to localhost:3000
app.listen(3000, function () {
    console.log('Your server is now listening on port 3000! Navigate to http://localhost:3000 to access it');
});


