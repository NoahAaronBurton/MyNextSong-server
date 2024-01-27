//todo: create express server

const express = require('express');
// const session = require('express-session');
const app = express();
// const path = require('path');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const axios = require('axios');
// const jwkToPem = require('jwk-to-pem'); 
const mysql = require('mysql');
const passport = require('passport');
const cookieSession = require('cookie-session');
const passportSetup =require('./passport');
const authRoutes = require('./routes/auth');


require('dotenv').config();

app.use(express.json());




app.use(cookieSession({
    name: 'google-auth-session',
    keys:['mynextsong'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);


app.use(
    cors({
        origin: 'http://localhost:5173', //! change in production: URL of client-side making requests to server
        methods: 'GET,PUT,POST,DELETE',
        credentials: true
    })
)


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

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));