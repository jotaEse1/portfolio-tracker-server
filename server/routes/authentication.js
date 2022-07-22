const express = require('express');
const router = express.Router()
const { signin, login } = require('../validator/validator')
const {signIn, logIn, checkToken, logOut} = require('../controllers/authentication')

//routes
router.route('/signin').post(signin, signIn)
router.route('/login').post(login, logIn)
router.route('/refresh_token').post(checkToken)
router.route('/logout').post(logOut)


module.exports = router;