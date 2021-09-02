var express = require('express')
var router = express.Router()

var {
	rooms,
	peoples
} = require('../controllers/search')

router.get('/rooms', rooms)
router.get('/peoples', peoples)

module.exports = router