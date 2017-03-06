// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var eSecurity = $("#security");
    var eAnswer = $("#answer");
    var errorAlert = $("#error-message");
	var serverErrorAlert = $("#server-error-message");
	var serverSuccessAlert = $("#server-success-message");

    function extractSignUpInputs() {
        // first, we check if there are values

        var UpdateSecurity = eSecurity.val();
        if (UpdateSecurity === undefined || UpdateSecurity === "" || UpdateSecurity === null) {
            throw " Security Question Field is Missing";
        }


        var UpdateAnswer = eAnswer.val();
        if (UpdateAnswer === undefined || UpdateAnswer === "" || UpdateAnswer === null) {
            throw "Answer Field is Missing";
        }
    }


    $("#formEdit").submit(function () {
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



})(jQuery);
// jQuery is exported as $ and jQuery
