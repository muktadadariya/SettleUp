// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var sEmail = $("#email");
    var sUser = $("#username");
    var sPassword = $("#password");
    var sConfirmPass = $("#confirmPassword");
    var sSecurity =  $("#secQues");
    var sAnswer = $("#secAns");
	var errorAlert = $("#error-message");
	var lEmail = $("#email2");
	var lPassword = $("#password2");
	var errorAlert2 = $("#error-message2");
	var serverErrorAlert = $("#server-error-message");
	var serverSuccessAlert = $("#server-success-message");
	
    function extractSignUpInputs() {
        // first, we check if there are values

        var signUpEmail = sEmail.val();
        if (signUpEmail === undefined || signUpEmail === "" || signUpEmail === null) {
            throw "Please enter Email to SignUp";
        }


        var signUpUser = sUser.val();
        if (signUpUser === undefined || signUpUser === "" || signUpUser === null) {
            throw "Please enter Username to Signup";
        }

        var signUpPassword = sPassword.val();
        if (signUpPassword === undefined || signUpPassword === "" || signUpPassword === null) {
            throw "Please enter Password";
        }

		if(signUpPassword.length < 6){
			throw "Password is too short! Minimum 6 characters are required.";
		}
		
		var signUpConfirmPass = sConfirmPass.val();
        if (signUpConfirmPass === undefined || signUpConfirmPass === "" || signUpConfirmPass === null) {
            throw "Please enter Confirm Password";
        }

		if(signUpPassword !== signUpConfirmPass){
			throw "Passwords don't match! Please try again!";
		}
		
        var signUpSecurity = sSecurity.val();
        if (signUpSecurity === undefined || signUpSecurity === "" || signUpSecurity === null) {
            throw "Please enter Security Question";
        }

        var signUpSecurityAnswer = sAnswer.val();
        if (signUpSecurityAnswer === undefined || signUpSecurityAnswer === "" || signUpSecurityAnswer === null) {
            throw "Please enter Answer for Security Question";
        }


    }
	
	function extractLoginInputs() {
        
        var loginEmail = lEmail.val();
        if (loginEmail === undefined || loginEmail === "" || loginEmail === null) {
            throw "Please enter your Email";
        }

        var loginPassword = lPassword.val();
        if (loginPassword === undefined || loginPassword === "" || loginPassword === null) {
            throw "Please enter your Password";
        }

    }
	
    $("#form1").submit(function () {
        errorAlert.addClass('hidden');
        errorAlert.text('');

        try {
			extractSignUpInputs();
			
        } catch (error) {
			serverSuccessAlert.text('');
			serverErrorAlert.text('');
			serverSuccessAlert.addClass('hidden');
			serverErrorAlert.addClass('hidden');
            errorAlert.text(error);
            errorAlert.removeClass('hidden');
			return false;
        }
    });
	
    $("#form2").submit(function () {
        errorAlert2.addClass('hidden');
        errorAlert2.text('');

        try {
            extractLoginInputs();
			
        } catch (error) {
            errorAlert2.text(error);
            errorAlert2.removeClass('hidden');
			return false;
        }
    });

})(jQuery);
// jQuery is exported as $ and jQuery
