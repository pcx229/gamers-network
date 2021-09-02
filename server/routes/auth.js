var express = require('express')
var router = express.Router()
var {ensureLoggedIn, ensureLoggedOut} = require('../util/ensureAuth')

var { login, logout, signup, is, reset_password, request_password_reset, profile } = require('../controllers/auth')

router.post('/login', ensureLoggedOut(), login)
router.post('/signup', ensureLoggedOut(), signup)
router.get('/logout', ensureLoggedIn(), logout)
router.get('/is', is)
router.get('/profile', ensureLoggedIn(), profile)
router.get('/request_password_reset', ensureLoggedOut(), request_password_reset)
router.put('/reset_password', ensureLoggedOut(), reset_password)

module.exports = router
