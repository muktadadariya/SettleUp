// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var fpNewPassword = $("#newpassword");
	var fpConfirmNewPassword = $("#confirmnewpassword");
	var errorAlert = $("#error-messageFP3");
	var serverErrorAlert = $("#server-error-message");

    function extractFPInputs() {
        // first, we check if there are values

        var password1 = fpNewPassword.val();
        if (password1 === undefined || password1 === "" || password1 === null) {
            throw "Please enter password to proceed";
        }
		
		if(password1.length < 6){
			throw "Password is too short! Minimum 6 characters are required.";
		}
		
        var confirmPassword = fpConfirmNewPassword.val();
        if (confirmPassword === undefined || confirmPassword === "" || confirmPassword === null) {
            throw "Please confirm password to proceed";
        }
		
		if(password1 !== confirmPassword){
			throw "Passwords don't match! Please try again!";
		}

    }
	
    $("#formFP3").submit(function () {
        errorAlert.addClass('hidden');
        errorAlert.text('');

        try {
			extractFPInputs();
			
        } catch (error) {
			serverErrorAlert.text('');
			serverErrorAlert.addClass('hidden');
            errorAlert.text(error);
            errorAlert.removeClass('hidden');
			return false;
        }
    });
	

})(jQuery);
// jQuery is exported as $ and jQuery
