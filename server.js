// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

// Parse incoming JSON payloads
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Obtain token endpoint
app.post('/createCard', async (req, res) => {
    try {
        // Step 1: Obtain token
        const tokenResponse = await axios.post(authUrl, tokenData, { headers: tokenHeaders });
        const accessToken = tokenResponse.data.access_token;
        
        // Extract user data from the incoming request
        const { firstName, lastName, email } = req.body;

        // Step 2: Make an Issue Wallet API call
        const apiHeaders = {
            Authorization: 'Bearer ' + accessToken
        };
        const issueWalletData = {
            brandId: 9,
            programId: 265,
            templateId: 180,
            passdata: {
                metaData: {
                    seller: "Hatton"
                }
            },
            person: {
                email: email,
                firstName: firstName,
                lastName: lastName
            }
        };
        const issueWalletResponse = await axios.post(getProxyURL(issueWalletEndpoint), issueWalletData, { headers: apiHeaders });
        
        res.json(issueWalletResponse.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function getProxyURL(targetURL) {
    const baseURL = 'https://bambu-cors-9374b174ef1e.herokuapp.com/proxy?url=';
    return baseURL + encodeURIComponent(targetURL);
}
