// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var fpEmail = $("#emailFP");
	var errorAlert = $("#error-messageFP");
	var serverErrorAlert = $("#server-error-message");
	
    function extractFPInputs() {
        // first, we check if there are values

        var Email = fpEmail.val();
        if (Email === undefined || Email === "" || Email === null) {
            throw "Please enter Email to proceed";
        }

    }
	
    $("#formFP").submit(function () {
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
