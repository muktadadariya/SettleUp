// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var receiverId = $("#settlewith");
    var amnt = $("#amountSettle");
	var errorAlert = $("#error-message");
	var serverErrorAlert = $("#server-error-message");
	var serverSuccessAlert = $("#server-success-message");

    function extractSettleInputs() {
        // first, we check if there are values
        var receiver = receiverId.val();
        if (receiver === undefined || receiver === "" || receiver === null)
        {
            throw "Please select the name of the person.";
        }

        var amount1 = amnt.val();
        if (amount1 === undefined || amount1 === "" || amount1 === null)
        {
            throw "Please provide amount of the bill to be settled";
        }

    }

    $("#formSettle").submit(function () {
        errorAlert.addClass('hidden');
        errorAlert.text('');

        try {
            extractSettleInputs();

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