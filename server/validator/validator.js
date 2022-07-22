const { body } = require('express-validator')

module.exports= {
    signin: [
        body('email', 'Please provide a valid email').isEmail(), 
        body('password', 'Please provide a longer password').isLength({min: 8}), 
        body('username', 'Please provide a longer username').isLength({min: 8})],
    login: [
        body('email', 'Please provide a valid email').isEmail(), 
        body('password', 'Please provide a longer password').isLength({min: 8})]
} 