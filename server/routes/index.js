var express = require('express')
var router = express.Router()

var authRouter = require('./auth')
var contactRouter = require('./contact')
var gamesRouter = require('./games')
var roomRouter = require('./room')
var searchRouter = require('./search')
var profileRouter = require('./profile')
var notificationRouter = require('./notification')

router.use('/auth', authRouter)
router.use('/contact', contactRouter)
router.use('/notification', notificationRouter)
router.use('/games', gamesRouter)
router.use('/room', roomRouter)
router.use('/search', searchRouter)
router.use('/profile', profileRouter)

module.exports = router
