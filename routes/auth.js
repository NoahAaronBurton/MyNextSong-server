const router = require('express').Router();
const passport = require('passport');


router.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: 'auth.js: user has successfully authenticated',
            user: req.user,
        });
    } else {
        res.status(403).json({
            error: true,
            message: 'auth.js: user not loggin in'
        });
    
    }
})

router.get(
    "/login/failed", (req, res) => {
        res.status(401).json({
            error: true,
            message: 'auth.js: user failed to authenticate'
        });
    }
)

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: `${process.env.CLIENT_URL}/home`, 
        failureRedirect: "/login/failed"
    } 
    ),    
)

router.get("/google", [passport.authenticate("google", [ "profile", "email", "https://www.googleapis.com/auth/drive.file"])]);

router.get("/logout", (req, res) => {
    req.logout();
    res.json({
        error: false,
        message: 'auth.js: user has successfully logged out'});
    console.log('auth.js: user has successfully logged out');    
});

module.exports = router;