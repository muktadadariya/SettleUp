// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var fpanswer = $("#answer");
	var errorAlert = $("#error-messageFP2");
	var serverErrorAlert = $("#server-error-message");

    function extractFPInputs() {
        // first, we check if there are values

        var answer = fpanswer.val();
        if (answer === undefined || answer === "" || answer === null) {
            throw "Please enter answer to proceed";
        }

    }
	
    $("#formFP2").submit(function () {
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
