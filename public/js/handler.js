// Function to send a message and initiate the process
console.log("Script is running");
let accessToken;  // Store the token here once fetched



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
//modalOkButton.addEventListener("click", closeModal);
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
//function showReservationPopup() {
  //  var popup = document.getElementById("popup");
   //// popup.style.display = 'flex';
//}
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


(function() {
    //let currentStep = 1;

    window.showStep = function(step) {
        const steps = document.querySelectorAll('.wizard .step');
        for (let s of steps) {
            s.style.display = 'none';  // Hide all steps
        }
        document.querySelector('#step' + step).style.display = 'block'; // Show the desired step
    }

    window.nextStep = function() {
        if (currentStep < 3) { // Assuming you have 3 steps
            currentStep++;
            showStep(currentStep);
        }
    }

    window.prevStep = function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        showStep(1);  // Initialize the first step when the document loads
    });

})(); // End of IIFE
var currentStep = 1;
//let currentStep = 1; // Start at the first step by default

function showStep(step) {
    // Grab all steps
    console.log("Attempting to show step: ", step);
    const steps = document.querySelectorAll('.wizard .step');
    
    // Hide all of them
    for (let s of steps) {
        s.style.display = 'none';  
    }
    
    // Show the specified step
    document.querySelector('#step' + step).style.display = 'block'; 
}

function nextStep() {
    console.log("nextStep called. Current step:", currentStep);
    // Check if we can progress to the next step
    if (currentStep < 3) { 
        currentStep++;
        console.log("Incrementing step to: ", currentStep);
        showStep(currentStep);
    } else {
        console.log("Cannot increment step further.");
    }
}


function prevStep() {
    // Check if we can go back a step
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

//function openModal() {
    //document.getElementById('myModal').style.display = 'block';
//}

//function closeModal() {
   // document.getElementById('myModal').style.display = 'none';
//}
// Add an event listener for the button click:
document.addEventListener('DOMContentLoaded', (event) => {
   showStep(1);  // Initialize the first step when the document loads
});
//let currentStep = 1;






