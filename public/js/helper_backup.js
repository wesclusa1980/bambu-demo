 // Main function
 document.addEventListener("DOMContentLoaded", function() {
    console.log("Document ready");

    // Functions for Modal
    function openModal(modalId) {
        $("#" + modalId).show();
    }
    
    function closeModal() {
        $(".modal").hide();
    }

    // Functions for Popup
    function showPopup() {
        $("#popup").addClass("popup-visible");
        $("#overlay").show();
    }
    
    function hidePopup() {
        $("#popup").removeClass("popup-visible");
        $("#overlay").hide();
    }
    $("#show-popup-img").click(function() {
        showPopup();
    });
    
    // Event Listeners for Modal
    $("#changeCardButton").on("click", function(event) {
        event.preventDefault();
        console.log("Change Card button clicked");
        // Assuming passId, email, and accessToken are available here
        changeCard(passId, email, accessToken);
        openModal("myModal");
    });
    $("#show-popup-btn").click(function() {
        $("#popup").addClass("show-popup");
    });
    
    $("#popup-close-btn").click(function() {
        $("#popup").removeClass("show-popup");
    });
    
    $(".open-modal-button").click(function() {
        var modalId = $(this).data('modal-id');
        openModal(modalId);
    });

    $(".close").click(function() {
        closeModal();
    });

    $(window).click(function(event) {
        if ($(event.target).hasClass("modal")) {
            closeModal();
        }
    });

    // Event Listeners for Popup
    $("#show-popup-btn").click(function() {
        showPopup();
    });

    $("#popup-close-btn").click(function() {
        hidePopup();
    });

    $("#popup-form").submit(function(event) {
        event.preventDefault();
        const name = $("#name").val();
        const email = $("#email").val();
        console.log("Name:", name, "Email:", email);
        hidePopup();
    });
    document.getElementById("get-digital-card").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action for the click event
        sendMessage(); // Call your sendMessage function
    });
    document.getElementById("send_message").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action for the click event
        sendMessage(); // Call your sendMessage function
    });
    
    // Function to make the issue-wallet API call with the bearer token
    function makeIssueWalletApiCall(accessToken, firstName, lastName, email, favoriteColor) {
        // Construct the API endpoint URL
        var issueWalletUrl = 'https://sandbox.api.bambumeta.software/brands/9/programs/265/issue-wallet';
        
        // Create headers for the API call
        var apiHeaders = {
            Authorization: 'Bearer ' + accessToken
        };

        // Create data for the issue-wallet API call
        var issueWalletData = {
            brandId: 9,
            programId: 265,
            templateId: 180,
            passdata: {
                metaData: {
                    seller: "Hatton"
                }
            },
            person: {
                firstName: firstName,
                lastName: lastName,
                email: email
            }
        };

        // Display the spinner while API call is in progress
        var spinnerContainer = document.querySelector('.spinner_container');
        spinnerContainer.style.display = 'block';

        // Make the API call to issue-wallet
        $.ajax({
            url: 'http://localhost:8080/' + issueWalletUrl,
            method: 'POST',
            headers: apiHeaders,
            data: JSON.stringify(issueWalletData),
            contentType: 'application/json',
            success: function(issueWalletResponse) {
                console.log('Successfully created card', issueWalletResponse);
                // Store passId and email in variables
                var passId = issueWalletResponse.passId;
                var email = issueWalletResponse.email;

                // Create the complete download URL
                var completeDownloadUrl = 'https://wallet-pass-sandbox.bambumeta.software' + issueWalletResponse.downloadUrl;

                // Hide the spinner
                spinnerContainer.style.display = 'none';

                // Show a success message to the user
                var modalContent = document.querySelector('.popup_description_wrap');
                modalContent.innerHTML = '<div class="success_message"><p>Card created successfully! Click the button below to download your pass.</p><div class="shane_tm_button" data-position="left"><a id="download_button" class="shane_tm_button_dark" href="' + completeDownloadUrl + '" target="_blank">Download Pass</a></div></div>';

                // Apply styles to the success message
                var successMessage = modalContent.querySelector('.success_message');
                successMessage.style.textAlign = 'center';
                successMessage.style.padding = '20px';
            },
            error: function(error) {
                console.log('Failed to create card', error);

                // Hide the spinner
                spinnerContainer.style.display = 'none';
                // You can show an error message to the user here
            }
        });
    }

    // Function to change the card using a patch API call
    function changeCard(passId, email, accessToken) {
        // Construct the API endpoint URL
        var patchUrl = 'https://sandbox.api.bambumeta.software/nft/9/wallet-templates/180/wallets?email=' + encodeURIComponent(email);
        
        // Create headers for the API call
        var apiHeaders = {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        };

        // Create data for the patch API call
        var patchData = {
            templateTierId: 115,
            passdata: {
                points: 100
            }
        };

        // Make the API call as a PATCH request
        $.ajax({
            url: 'http://localhost:8080/' + patchUrl,
            method: 'PATCH',
            headers: apiHeaders,
            data: JSON.stringify(patchData),
            contentType: 'application/json',
            success: function(response) {
                console.log('Card updated successfully', response);

                // You can show a success message to the user here
            },
            error: function(error) {
                console.log('Failed to update card', error);

                // You can show an error message to the user here
            }
        });
        
    }

    
    // Function to send the message and create the card
    function sendMessage() {
        // Display the spinner while API calls are in progress
        var spinnerContainer = document.querySelector('.spinner_container');
        spinnerContainer.style.display = 'block';
    
        // Retrieve form values
        var firstName = document.getElementById("first_name").value;
        var lastName = document.getElementById("last_name").value;
        var email = document.getElementById("email").value;
        var favoriteColor = document.getElementById("favorite_color").value;
    
        // Check if values are provided for required fields
        if (!firstName || !lastName || !email) {
            console.log('Required fields missing.');
            alert('Please fill out the required fields.'); 
            spinnerContainer.style.display = 'none';
            return;
        }
    
        console.log('Form data:', {firstName, lastName, email, favoriteColor});
    
        // Create URL for the authentication API
        var authUrl = 'https://sandbox-auth.bambumeta.software/oauth2/token';
        
        // Request data for token generation
        var tokenData = {
            grant_type: 'client_credentials'
        };
    
        // Create headers for token generation
        var tokenHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa('4mml4rs040gcmknikh8eg6170q' + ':' + '9381m4jhqji7eir2nmpg9fph0aj2bsu1j508mrc3e57aar99727')
        };
    
        // Make the API call to obtain the bearer token
        $.ajax({
            url: authUrl,
            method: 'POST',
            headers: tokenHeaders,
            data: tokenData,
            success: function(tokenResponse) {
                // Extract the bearer token
                var accessToken = tokenResponse.access_token;
                console.log('Generated token:', accessToken);
    
                // Use the bearer token in the issue-wallet API call
                makeIssueWalletApiCall(accessToken, firstName, lastName, email, favoriteColor);
            },
            error: function(error) {
                console.log('Failed to obtain bearer token', error);
                // Hide the spinner
                spinnerContainer.style.display = 'none';
                // You can show an error message to the user here
            }
        });
    
        return false; // To prevent default behavior, especially if the function is bound to an onclick of an anchor or form submit.
    }
    

});