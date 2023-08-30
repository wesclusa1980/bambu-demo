document.addEventListener("DOMContentLoaded", function() {
    // Get the form element
    const form = document.getElementById("contact_form");
  
    // Listen for the submit event on the form
    form.addEventListener("submit", function(event) {
      // Prevent the default form submission
      event.preventDefault();
  
      // Get form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;
  
      // Prepare data to send
      const data = {
        name: name,
        email: email,
        message: message
      };
  
      // Make the API call to Zapier Webhook URL
      fetch("YOUR_ZAPIER_WEBHOOK_URL_HERE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        console.log("Success:", data);
        // You can add any actions to take on success here
      })
      .catch((error) => {
        console.error("Error:", error);
        // You can add any actions to take on failure here
      });
    });
  });
  