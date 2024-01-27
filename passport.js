require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback', //must match authorized redirect URI in google console
    scope: ['profile', 'email']
},
function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    cb(null, profile);
}));

passport.serializeUser((user, done) => { // decides what to store in the session
    done(null, user);
});

passport.deserializeUser((user, done) => { // retrieves the user from the session
    done(null, user);
});

module.exports = passport;