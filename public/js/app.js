const express = require('express');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded event fired");

    // Listen for click event on open-modal-button elements
    var openModalButtons = document.querySelectorAll(".open-modal-button");
    openModalButtons.forEach(function(button) {
        button.addEventListener("click", function(event) {
            console.log("Open modal button clicked");
            event.preventDefault();

            var modalId = button.getAttribute("data-modal-id");
            console.log("Modal ID:", modalId);

            var modal = document.getElementById(modalId);
            console.log("Modal element:", modal);

            modal.style.display = "block";
        });
    });

    // Listen for click event on close buttons inside the modals
    var closeButtons = document.querySelectorAll(".close");
    closeButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            console.log("Close button clicked");
            var modal = button.closest(".modal");
            modal.style.display = "none";
        });
    });

    // Listen for click event on window to close modal when clicking outside
    window.addEventListener("click", function(event) {
        console.log("Window clicked");
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    });
});
