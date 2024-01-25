//todo: create express server

const express = require('express');
const session = require('express-session');
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

app.use(session({
    secret: 'mynextsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //! set to true if  on https
  }));


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
        // console.log('google auth route hit ', req.body.token);
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
                // console.log(decoded);

                // check if the user (email) exists in the database
                const sql = 'SELECT * FROM Users WHERE email = ?';
                db.query(sql, decoded.email, (err, result) => {
                    if (err) {
                        next(err);
                    } else if (result.length > 0) {
                        // user already exists, log them in
                        console.log('User already exists');
                        console.log(result);

                        // create a session
                        req.session.user = {
                            id: result[0].id,
                            email: result[0].email
                        };

                        // send session to the front end
                        res.json({ session: req.session });
                        console.log('Session created!');

                    } else {
                        // user does not exist, create a new user
                        const user = {
                            email: decoded.email,
                            picture: decoded.picture,
                            given_name: decoded.given_name,
                        };

                        const sql = 'INSERT INTO Users SET ?';
                        db.query(sql, user, (err, result) => {
                            if (err) {
                                next(err);
                            } else {
                                console.log('User created');
                                console.log(result);

                                // create a session
                                req.session.user = {
                                    id: result.insertId,
                                    email: user.email
                                };

                                // send session to the front end
                                res.json({ session: req.session });
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => console.log('Server started on port 3000'));