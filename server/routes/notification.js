
var express = require('express')
var router = express.Router()
var {ensureLoggedIn} = require('../util/ensureAuth')

var { create, list, mark, remove } = require('../controllers/notification')

router.get('/', ensureLoggedIn(), list)
router.put('/mark-as-read', ensureLoggedIn(), mark)
router.post('/', ensureLoggedIn(), create)
router.delete('/', ensureLoggedIn(), remove)

module.exports = router