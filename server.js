//todo: create express server

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem'); 

require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));

// post route to handle google auth jwt
app.post('/api/auth/google', async (req, res, next) => {
    try {
        console.log('google auth route hit ', req.body.token);
        const token = req.body.token;

        // get the public key from Google API
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/certs');
        const publicKey = jwkToPem(response.data.keys[0]); // convert JWK to PEM

        // verify the token
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                // token is invalid
                next(err);
            } else {
                // token is valid, decoded object will contain the data stored in the token
                console.log(decoded);
                // your logic here
            }
        });
    } catch (err) {
        next(err);
    }
})

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => console.log('Server started on port 3000'));