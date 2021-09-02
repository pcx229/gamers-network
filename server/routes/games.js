var express = require('express')
var router = express.Router()

var { list, cover, random, autoComplete, info } = require('../controllers/games')

router.get('/random', random)
router.get('/autoComplete', autoComplete)
router.get('/info', info)
router.get('/cover/:name', cover)
router.get('/list', list)

module.exports = router