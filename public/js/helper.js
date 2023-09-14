// Function to send a message and initiate the process
let accessToken;  // Store the token here once fetched
var storedEmail = null;

// Function to create a proxy URL
function getProxyURL(targetURL) {
    const baseURL = 'https://bambu-cors-9374b174ef1e.herokuapp.com/proxy?url=';
    return baseURL + encodeURIComponent(targetURL);
}

// Function to obtain a token
export function obtainToken(callback) {
    var authUrl = 'https://sandbox-auth.bambumeta.software/oauth2/token';
    var tokenData = {
        grant_type: 'client_credentials'
    };
    var tokenHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa('4mml4rs040gcmknikh8eg6170q' + ':' + '9381m4jhqji7eir2nmpg9fph0aj2bsu1j508mrc3e57aar99727')
    };

    $.ajax({
        url: authUrl,
        method: 'POST',
        headers: tokenHeaders,
        data: tokenData,
        success: function(tokenResponse) {
            const accessToken = tokenResponse.access_token;
            console.log('Generated token:', accessToken);
            if (typeof callback === 'function') callback(accessToken);
        },
        error: function(error) {
            console.log('Failed to obtain bearer token', error);
            // Hide the spinner
            document.querySelector('.spinner_container').style.display = 'none';
        }
    });
}

// Function to create a card
function createCard() {
    // Retrieve form values
    var firstName = document.getElementById("first_name").value;
    var lastName = document.getElementById("last_name").value;
    var email = document.getElementById("email").value;

    // Assuming obtainToken function fetches and returns the token
    obtainToken(function(accessToken) {
        // Make an AJAX request to your server's endpoint
        $.ajax({
            url: '/makeIssueWalletApiCall',  // Your server endpoint
            method: 'POST',
            data: {
                accessToken: accessToken,
                firstName: firstName,
                lastName: lastName,
                email: email
            },
            success: function(response) {
                // Handle the success response here (update the UI, etc.)
                console.log('Successfully created card:', response);
                //... remaining success code
            },
            error: function(error) {
                console.log('Error:', error);
                // Handle the error here
            }
        });
    });
}


// Function to make the Issue Wallet API call
export function makeIssueWalletApiCall(accessToken, firstName, lastName, email) {
    // Rest of the code remains unchanged...
    // Construct the API endpoint URL
    showSpinner();
    var issueWalletEndpoint = 'https://sandbox.api.bambumeta.software/brands/9/programs/265/issue-wallet';
    
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
            email: email
        }
    };

    // Add firstName and lastName to the data only if they are provided
    if (firstName) {
        issueWalletData.person.firstName = firstName;
    }
    if (lastName) {
        issueWalletData.person.lastName = lastName;
    }

    console.log('Issuing Wallet with data:', issueWalletData);
    // Make the API call to issue-wallet
    $.ajax({
        url: getProxyURL(issueWalletEndpoint),
        method: 'POST',
        headers: apiHeaders,
        data: JSON.stringify(issueWalletData),
        contentType: 'application/json',
        success: function(issueWalletResponse) {
            console.log('Successfully created card', issueWalletResponse);
        
            // Store the required values in sessionStorage
            if (issueWalletResponse.passId && issueWalletResponse.personId) {
                sessionStorage.setItem("passId", issueWalletResponse.passId);
                sessionStorage.setItem("personId", issueWalletResponse.personId);
            }
            var storedPassId = sessionStorage.getItem("passId");
            var storedPersonId = sessionStorage.getItem("personId");
            console.log("Stored passId:", storedPassId);
            console.log("Stored personId:", storedPersonId);
            hideSpinner();
            showMessageModal();
            // Hide the spinner
            
        
            // Show a success message to the user
            var modalContent = document.querySelector('.popup_description_wrap');
            modalContent.innerHTML = '<div class="success_message"><p>Card created successfully! Click the button below to download your pass.</p><div class="shane_tm_button" data-position="left"><a id="download_button" class="shane_tm_button_dark" href="' + 'https://wallet-pass-sandbox.bambumeta.software' + issueWalletResponse.downloadUrl + '" target="_blank">Download Pass</a></div></div>';
        
            // Apply styles to the success message
            var successMessage = modalContent.querySelector('.success_message');
            successMessage.style.textAlign = 'center';
            successMessage.style.padding = '20px';
           
            

        },
        error: function(error) {
            console.log('Failed to create card', error);

            // Hide the spinner
            var spinnerContainer = document.querySelector('.spinner_container');
            spinnerContainer.style.display = 'none';
            // You can show an error message to the user here
        }
    });
}


document.addEventListener("DOMContentLoaded", function() {
    
    var showPopupButton = document.getElementById("show-popup-btn");
    var closePopupButton = document.getElementById("popup-close-btn");
    var popup = document.getElementById("popup");

    if (showPopupButton) {
        console.log('Button was clicked');
        showPopupButton.addEventListener("click", function() {
            popup.style.display = 'flex';  // Show the popup
        });
    }

    if (closePopupButton) {
        closePopupButton.addEventListener("click", function() {
            popup.style.display = 'none';  // Hide the popup
        });
    }

    // Optional: Close the popup when the grey background is clicked
    popup.addEventListener("click", function(event) {
        if (event.target === popup) {  // Check if the background was clicked, not a child element
            popup.style.display = 'none';  // Hide the popup
        }
    });

});


    // New listeners added below:
    document.getElementById("usecase-button").addEventListener("click", function(event) {
        event.preventDefault();
        handleUseCaseButtonClick();
        //console.log('listener for usecase'); 
    });
    //Modal for marketing use cases
    function handleUseCaseButtonClick() {
        var email = document.getElementById("email").value;
        console.log('Stored email:', sessionStorage.getItem("email"));
        console.log('Stored passId:', sessionStorage.getItem("passId"));
    
        if (!email) {
            if (storedEmail) {
                email = storedEmail;
                console.log('Using stored email:', email);
            } else {
                console.log('email is empty');
                email = prompt("Please enter your email address:");
                if (!email) {
                    alert('Please provide an email address.');
                    return;
                }
            }
        }
        
        // Log the email to the console
        console.log('Using email:', email);
        showSpinner();
    
        if (!accessToken) {
            console.log('No access token found. Fetching token...');
            
            fetchToken((fetchedToken) => {
                // Log that the token has been fetched
                console.log('Access token fetched successfully.');
                console.log('Fetched token:', fetchedToken);
                makeIssueWalletApiCall(accessToken, null, null, email, null);
            });
        } else {
            console.log('Email at this point:', email);
            console.log('Using existing access token.');
            makeIssueWalletApiCall(accessToken, null, null, email, null);
        }
    }
    
    
    function makeApiCallWithEmail(email) {
        console.log('Making API call with email:', email);
        var selectedAction = document.getElementById("actionType").value;
        var apiUrl = 'https://sandbox.api.bambumeta.software/brands/9/programs/265/issue-wallet?email=' + email;
        
        var apiHeaders = {
            "Authorization": "Bearer " + accessToken,
            'Content-Type': 'application/json'
        };
        
        var apiRequestBody = {};
        // Fill the apiRequestBody based on the selectedAction...
        
        fetch(apiUrl, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify(apiRequestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Full API Response:', data);
            // Assuming the API response has the structure mentioned above
            var issueWalletResponse = data.issueWalletResponse;
    
            if (issueWalletResponse && issueWalletResponse.passId && issueWalletResponse.personId) {
                sessionStorage.setItem("passId", issueWalletResponse.passId);
                sessionStorage.setItem("personId", issueWalletResponse.personId);
    
                // After storing in sessionStorage, retrieve them to log or use elsewhere
                var storedPassId = sessionStorage.getItem("passId");
                var storedPersonId = sessionStorage.getItem("personId");
    
                console.log("Stored passId:", storedPassId);
                console.log("Stored personId:", storedPersonId);
            }
    
            console.log("API call successful:", data);
            updatePopupContentForSuccess();
            console.log('makeApiCallWithEmail: Function completed successfully');
        })
        .catch(error => {
            console.log("API call failed:", error);
        });
    }
    
    function updatePopupContentForSuccess() {
        var popupContent = document.querySelector(".popup-content");
    
        // Set the new content
        popupContent.innerHTML = `
            <p>Check your card!</p>
            <button id="ok-button">OK</button>
        `;
    
        // Add event listener to the OK button to close the popup
        document.getElementById("ok-button").addEventListener("click", function() {
            document.getElementById("popup").style.display = "none";
        });
    }
    
    function fetchToken(callback) {
        // Display the spinner while API calls are in progress
        var spinnerContainer = document.querySelector('.spinner_container');
        spinnerContainer.style.display = 'block';
    
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
                accessToken = tokenResponse.access_token; // Assuming accessToken is a global variable
                console.log('Generated token:', accessToken);
                spinnerContainer.style.display = 'none'; // Hide the spinner
                console.log('Calling the provided callback...');
                if (typeof callback === "function") {
                    callback(tokenResponse.access_token);
                } else {
                    console.log('Provided callback is not a function.');
                }
            },
            error: function(error) {
                console.log('Failed to obtain bearer token', error);
                spinnerContainer.style.display = 'none'; // Hide the spinner
                // You can show an error message to the user here
            }
        });
    }
    
    function updatePopupContentForSuccess() {
        var popupContent = document.querySelector(".popup-content");
    
        // Set the new content
        popupContent.innerHTML = `
            <p>Check your card!</p>
            <button id="ok-button">OK</button>
        `;
    
        // Add event listener to the OK button to close the popup
        document.getElementById("ok-button").addEventListener("click", function() {
            document.getElementById("popup").style.display = "none";
        });
    }
    

    // Show the popup logic
    var showPopupButton = document.getElementById("show-popup-btn");
    if (showPopupButton) {
        showPopupButton.addEventListener("click", function() {
            document.getElementById('popup').style.display = 'block';
            document.getElementById('messageModal').style.display = 'none';
            
        });
    }

    // Close the popup logic
    var closePopupButton = document.getElementById("popup-close-btn");
    if (closePopupButton) {
        closePopupButton.addEventListener("click", function() {
            document.getElementById('popup').style.display = 'none';
        });
    }

    // Create a new card logic
    var createCardButton = document.getElementById("submit-button");
    if (createCardButton) {
        createCardButton.addEventListener("click", function(event) {
            event.preventDefault(); // to prevent the default action
            createNewCard();
        });
    }

function createNewCard() {
    let newCard = {
        id: Date.now(),
        name: document.getElementById('card-name').value,
        description: document.getElementById('card-description').value,
        assignedTo: document.getElementById('card-assigned-to').value
    };

    document.getElementById('card-name').value = '';
    document.getElementById('card-description').value = '';
    document.getElementById('card-assigned-to').value = '';

    console.log(newCard);  // For debugging purposes
    // The logic for appending this card to your page or storing it somewhere would go here.
}
function showMessageModal() {
    var modal = document.getElementById("messageModal");
    modal.style.display = "block";
}
function closeModal() {
    
    var modal = document.getElementById("messageModal");
    modal.style.display = "none";
    document.getElementById("popup").style.display = "none";
}
var modalOkButton = document.getElementById("modalOkButton");
modalOkButton.addEventListener("click", closeModal);
function showSpinner() {
    var spinner = document.getElementById("spinnerModal");
    spinner.style.display = "block";
}
function hideSpinner() {
    var spinner = document.getElementById("spinnerModal");
    spinner.style.display = "none";
}

