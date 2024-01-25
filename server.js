//todo: create express server

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem'); 
const mysql = require('mysql');

require('dotenv').config();

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

// connect to the database
db.connect((err) => {
    if (err) {
      throw err;
    } else {
      console.log('Connected to the MySQL database');
    }
  });  

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
                // check if the user exists in the database, if not, create a new user


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