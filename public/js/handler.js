// Function to send a message and initiate the process
let accessToken;  // Store the token here once fetched
let firstNameFromForm = document.getElementById("first_name").value;
let lastNameFromForm = document.getElementById("last_name").value;
let emailFromForm = document.getElementById("email").value;

// Function to create a proxy URL
function getProxyURL(targetURL) {
    const baseURL = 'https://bambu-cors-9374b174ef1e.herokuapp.com/proxy?url=';
    return baseURL + encodeURIComponent(targetURL);
}

// Function to obtain a token
function obtainToken(callback) {
    const authUrl = 'https://sandbox-auth.bambumeta.software/oauth2/token';
    const tokenData = {
        grant_type: 'client_credentials'
    };
    const tokenHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa('4mml4rs040gcmknikh8eg6170q' + ':' + '9381m4jhqji7eir2nmpg9fph0aj2bsu1j508mrc3e57aar99727')
    };

    $.ajax({
        url: authUrl,
        method: 'POST',
        headers: tokenHeaders,
        data: tokenData,
        success: function(tokenResponse) {
            accessToken = tokenResponse.access_token;
            console.log('Generated token:', accessToken);
            if (typeof callback === 'function') callback(accessToken);
        },
        error: function(error) {
            console.log('Failed to obtain bearer token', error);
            document.querySelector('.spinner_container').style.display = 'none';  // Hide the spinner
        }
    });
}

// Function to make the Issue Wallet API call
function makeIssueWalletApiCall(accessToken, firstName, lastName, email) {
    const urlParams = new URLSearchParams(window.location.search);
    const sellerValue = urlParams.get('seller') || "defaultSeller"; // defaultSeller is a fallback if the parameter is not found. Adjust as needed.
    // Rest of the code remains unchanged...
    // Construct the API endpoint URL
    //showSpinner();
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
                seller: sellerValue
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
                sessionStorage.setItem("email", email);

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
function initiateCreateCardProcess() {
    // First, fetch the token.
    showSpinner();
    obtainToken(function(accessToken) {
        if (accessToken) {
            // Now, retrieve form values.
            const firstName = document.getElementById("first_name").value;
            const lastName = document.getElementById("last_name").value;
            const email = document.getElementById("email").value;
            //email = document.getElementById("email").value; // Assign the email to the global variable
             // Add to HubSpot
             addRecordToHubSpot(firstName, lastName, email);
            // Call the makeIssueWalletApiCall to create the wallet card.
            makeIssueWalletApiCall(accessToken, firstName, lastName, email);
        } else {
            console.log('Failed to fetch the access token.');
        }
    });
}
function addRecordToHubSpot(firstName, lastName, email, phone, company, website) {
    const hubSpotURL = "https://api.hubapi.com/crm/v3/objects/contacts/batch/create";
    const bearerToken = "pat-na1-7f6cdc57-a7d9-427c-bd08-a2af4f399b59";  // Replace with your actual token.

    const data = {
        inputs: [
            {
                properties: {
                    email: email,
                    phone: phone,
                    company: company,
                    website: website,
                    lastname: lastName,
                    firstname: firstName
                    
                },
                associations: []
            }
        ]
    };

    // Fetch using the proxy URL
    fetch(getProxyURL(hubSpotURL), {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bearerToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
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
    console.log(spinner); // Log the value here
    spinner.style.display = "block";
}
function hideSpinner() {
    var spinner = document.getElementById("spinnerModal");
    spinner.style.display = "none";
}
function handleMarketingUseCase() {
    var storedEmail = sessionStorage.getItem("email"); 
    console.log('Stored email:', storedEmail);
    console.log('Stored passId:', sessionStorage.getItem("passId"));
    console.log('email:', sessionStorage.getItem("email"));

    //var inputEmail = document.getElementById("email").value;
    
    if (!inputEmail) {
        if (storedEmail) {
            inputEmail = storedEmail;
            console.log('Using stored email:', inputEmail);
        } else {
            console.log('email is empty');
            inputEmail = prompt("Please enter your email address:");
            if (!inputEmail) {
                alert('Please provide an email address.');
                return;
            } else {
                email = inputEmail; // Update the global email variable
            }
        }
    } else {
        email = inputEmail; // Update the global email variable if the input has an email
    }

    var actionType = document.getElementById("actionType").value; // Fetch the selected option
    var requestBody = {};

    switch (actionType) {
        case "awardPoints":
            requestBody = {
                // Whatever your request body needs to be for awarding points
            };
            break;
        case "punchCard":
            requestBody = {
                // Whatever your request body needs to be for the punch card
            };
            break;
        default:
            console.log("Unknown action type selected.");
            return;
    }

    //showSpinner();

    if (!accessToken) {
        console.log('No access token found. Fetching token...');
        
        obtainToken((fetchedToken) => {
            console.log('Access token fetched successfully.');
            console.log('Fetched token:', fetchedToken);
            accessToken = fetchedToken;

            makeIssueWalletApiCall(accessToken, null, null, email, requestBody);
        });
    } else {
        console.log('Using existing access token.');
        makeIssueWalletApiCall(accessToken, null, null, email, requestBody);
    }
}
function showMarketingPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = 'flex';
}
function hideMyPopup() {
    document.getElementById("popup").style.display = 'none';
}
function updateOverlayText() {
    var firstName = document.getElementById('first_name').value;
    var lastName = document.getElementById('last_name').value;
    var combinedName = (firstName + " " + lastName).trim();
    
    var overlay = document.getElementById('overlayText');
    overlay.textContent = combinedName ? combinedName : "Your Text Here";
}

function updateImage(category) {
    var imageUrl = "";
    var overlayText = "";
    switch(category) {
        case 'marketing':
            imageUrl = "img/demo_card.png";
            overlayText = "Tye your name on the form";
            break;
        case 'messaging':
            imageUrl = "https://via.placeholder.com/150?text=Messaging";
            overlayText = "Messaging Details";
            break;
        case 'order':
            imageUrl = "https://via.placeholder.com/150?text=Order+Notifications";
            overlayText = "Order Notification Info";
            break;
        case 'receipt':
            imageUrl = "https://via.placeholder.com/150?text=Digital+Receipt";
            overlayText = "Digital Receipt Overview";
            break;
        case 'location':
            imageUrl = "https://via.placeholder.com/150?text=Location+Aware";
            overlayText = "Location-Aware Features";
            break;
    }
    checkFormAndSelector();
    var imageElement = document.getElementById('selectedImage');
    var textElement = document.getElementById('overlayText');
    
    imageElement.src = imageUrl;
    textElement.textContent = overlayText;
}
function scrollLeft() {
    let container = document.querySelector('.selector');
    container.scrollBy({left: -100, behavior: 'smooth'});
}

function scrollRight() {
    let container = document.querySelector('.selector');
    container.scrollBy({left: 100, behavior: 'smooth'});
}
function checkFormAndSelector() {
    let firstName = document.getElementById('first_name').value;
    let lastName = document.getElementById('last_name').value;
    let email = document.getElementById('email').value;
    let imageSelected = document.getElementById('selectedImage').src;
  
    let defaultImage = "path_to_your_default_image"; // replace with your default image path

    let button = document.getElementById('send_message');

    if(firstName && lastName && email && imageSelected !== defaultImage) {
        button.removeAttribute('disabled');
    } else {
        button.setAttribute('disabled', 'true');
    }
}

// Add an event listener for the button click:

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded fired");

    // Define these variables inside the listener
    console.log("show-popup-btn");
    var showPopupButton = document.getElementById("show-popup-btn");
    console.log("close-btn");
    var closePopupButton = document.getElementById("popup-close-btn");
    console.log("popup");
    var popup = document.getElementById("popup");

    if (showPopupButton) {
        console.log('Attempting to show popup...');
        showPopupButton.addEventListener("click", function() {
            console.log('Clicked show popup button');
            popup.style.display = 'flex';  // Show the popup
        });
    }

    if (closePopupButton) {
        closePopupButton.addEventListener("click", function() {
            popup.style.display = 'none';  // Hide the popup
        });
    }

    // Optional: Close the popup when the grey background is clicked
    if (popup) {
        popup.addEventListener("click", function(event) {
            if (event.target === popup) {  // Check if the background was clicked, not a child element
                popup.style.display = 'none';  // Hide the popup
            }
        });
    }

    const createCardButton = document.getElementById("send_message");
    if(createCardButton) {
        createCardButton.addEventListener('click', (e) => {
            e.preventDefault();
            initiateCreateCardProcess();
        });
    }

    const marketingUsecaseButton = document.getElementById("marketing-usecase");
    if (marketingUsecaseButton) {
        marketingUsecaseButton.addEventListener("click", function(event) {
            event.preventDefault();
            handleMarketingUseCase();
        });
    }
});
let currentStep = 1;

function showStep(step) {
    document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
    document.getElementById('step' + step).style.display = 'block';
}

function nextStep() {
    if (currentStep < 3) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

