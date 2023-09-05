
    // Main function
    $(document).ready(function() {
        console.log("Document ready");
        
        var changeCardButton = document.getElementById("changeCardButton");
        console.log("changeCardButton:", changeCardButton);
    
        var myModal = document.getElementById("myModal");
        console.log("myModal:", myModal);
    
        changeCardButton.addEventListener("click", function(event) {
            event.preventDefault();
            console.log("Change Card button clicked");
            myModal.style.display = "block";
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        // Add an event listener to the "Change Card" button
        console.log("Event listener clicked");
        var changeCardButton = document.getElementById("changeCardButton");
        console.log("changeCardButton:", changeCardButton);
        var myModal = document.getElementById("myModal");
        console.log("myModal:", myModal);

        // When the "Change Card" button is clicked, show the modal
        changeCardButton.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default behavior of the button
            console.log("Change Card button clicked");
            myModal.style.display = "block";
        });

        // When the "Close" button is clicked, close the modal
        var closeModal = document.getElementById("closeModal");
        closeModal.addEventListener("click", function() {
            console.log("Close button clicked");
            myModal.style.display = "none";
        });

        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click", function(event) {
            console.log("Window clicked");
            if (event.target == myModal) {
                myModal.style.display = "none";
            }
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

        // Function to display QR code
        function displayQRCode(downloadUrl) {
            // Construct the full QR code URL
            console.log('Displaying QR code with download URL:', downloadUrl);
            var qrCodeUrl = 'https://wallet-pass-sandbox.bambumeta.software' + downloadUrl;

            // Create a new image element for the QR code
            var qrCodeImg = document.createElement('img');

            // Set the source of the QR code image
            qrCodeImg.src = 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(qrCodeUrl);

            // Set attributes and styles for the image
            qrCodeImg.alt = 'QR Code';
            qrCodeImg.className = 'qr_code_img';

            // Append the QR code image to the container
            var qrCodeContainer = document.querySelector('.qr_code_container');
            qrCodeContainer.innerHTML = '';
            qrCodeContainer.appendChild(qrCodeImg);

            // Display the QR code container
            qrCodeContainer.style.display = 'block';
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

            return false;
        }

    });
