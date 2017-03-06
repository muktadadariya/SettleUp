// Remember, we're in a browser: prevent global variables from happening
// I am passing the jQuery variable into the IIFE so that
// I don't have to rely on global variable name changes in the future
(function ($) {

    var afEmail = $("#email");
	var errorAlert = $("#error-messageAF");
	var serverErrorAlert = $("#server-error-message");
	var serverSuccessAlert = $("#server-success-message");	

    function extractaddFriendInputs() {
		
        // first, we check if there are values
        var Email = afEmail.val();
        if (Email === undefined || Email === "" || Email === null) {
            throw "Please enter Email ID to proceed";
        }

    }
	

    $('#formAddFriend').on('submit', function(event) {
        event.preventDefault();

        console.log("form");
        var Email = $('#email');
        errorAlert.addClass('hidden');
        errorAlert.text('');
		serverSuccessAlert.addClass('hidden');
        serverSuccessAlert.text('');

        try{
           
            extractaddFriendInputs();
            $.ajax({
                url: '/addfriend',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({email:Email.val()}),
                success: function (response) {

                    var tbodyEl = $('tbody');

                    if(response.error != null){

                        console.log("error : " + response.error);
                        errorAlert.text(response.error);
                        errorAlert.removeClass('hidden');
                    }

                    if(response.friends != null) {
						serverSuccessAlert.text(response.successMsg);
						serverSuccessAlert.removeClass('hidden');
                        tbodyEl.html('');
                        response.friends.forEach(function (friendList) {
                            console.log("sucess");
                            tbodyEl.append('\
                            <tr>\
                                <td class="name" > ' + friendList.name + ' </td>\
                               <td class="email"> ' + friendList.email + ' &nbsp &nbsp  </td>\
                                <td>\
                                    <button  id="Remove" class="Remove btn btn-primary">Remove</button>\
                                </td>\
                            </tr>\
                        ');
                        });
                    }

                }
            });
        }catch (error){
			serverSuccessAlert.text('');
			serverErrorAlert.text('');
			serverSuccessAlert.addClass('hidden');
			serverErrorAlert.addClass('hidden');
			console.log("error");
			errorAlert.text(error);
			errorAlert.removeClass('hidden');
        }


    });

    $('table').on('click', '.Remove', function() {
        var rowEl = $(this).closest('tr');
        var Email = rowEl.find('.email').text();
        console.log(Email);
		 errorAlert.addClass('hidden');
        errorAlert.text('');
		serverSuccessAlert.addClass('hidden');
        serverSuccessAlert.text('');

        $.ajax({
            url: '/removefriend/' + Email,
            method: 'DELETE',
            contentType: 'application/json',
            success: function(response) {
                console.log(response);
                var tbodyEl = $('tbody');

                if(response.error != null){

                    console.log("error : " + response.error);
                    errorAlert.text(response.error);
                    errorAlert.removeClass('hidden');
                }

                if(response.friends != null) {
					serverSuccessAlert.text(response.successMsg);
					serverSuccessAlert.removeClass('hidden');
                    tbodyEl.html('');
                    response.friends.forEach(function (friendList) {
                        console.log("sucess");
                        tbodyEl.append('\
                            <tr>\
                                <td class="name" > ' + friendList.name + ' </td>\
                               <td class="email"> ' + friendList.email + ' &nbsp &nbsp  </td>\
                                <td>\
                                    <button  id="Remove" class="Remove btn btn-primary">Remove</button>\
                                </td>\
                            </tr>\
                        ');
                    });
                }

            }
        });
    });
	

})(jQuery);
// jQuery is exported as $ and jQuery

