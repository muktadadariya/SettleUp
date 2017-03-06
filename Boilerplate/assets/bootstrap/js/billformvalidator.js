// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var desc = $("#description");
    var amnt = $("#amount");
	var datepick = $("#datepicker");
	var sharedbyids = $("#sharedby");
	var errorAlert = $("#error-message");
	var serverErrorAlert = $("#server-error-message");
	var serverSuccessAlert = $("#server-success-message");
	


    function extractBillInputs() {
        // first, we check if there are values
        var description = desc.val();
        if (description === undefined || description === "" || description === null) {
            throw "Please provide description of the bill";
        }

        var amount = amnt.val();
        if (amount === undefined || amount === "" || amount === null) {
            throw "Please provide amount of the bill to be shared";
        }
		
		var date = datepick.val();
        if (date === undefined || date === "" || date === null) {
            throw "Please enter the date of your bill";
        }
		
        var participants = sharedbyids.val();
        if (participants === undefined || participants === "" || participants === null) {
            throw "Please select the participants of your bill";
        }
    }
	
    $("#formAdd").submit(function () {
        errorAlert.addClass('hidden');
        errorAlert.text('');
		

        try {
			extractBillInputs();
			
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

})(jQuery);
// jQuery is exported as $ and jQuery
