
var express = require('express')
var router = express.Router()
var {ensureLoggedIn} = require('../util/ensureAuth')

var { select, edit, getImage, listGames, addGame, removeGame, listFriends, addFriend, removeFriend, autoComplete, profileExistsMiddleware } = require('../controllers/profile')

router.get('/', profileExistsMiddleware, select)
router.put('/', ensureLoggedIn(), edit)
router.get('/image/:userId', getImage)
router.get('/games', profileExistsMiddleware, listGames)
router.post('/games', ensureLoggedIn(), addGame)
router.delete('/games', ensureLoggedIn(), removeGame)
router.get('/friends', profileExistsMiddleware, listFriends)
router.post('/friends', ensureLoggedIn(), addFriend)
router.delete('/friends', ensureLoggedIn(), removeFriend)
router.get('/autoComplete', autoComplete)

module.exports = router