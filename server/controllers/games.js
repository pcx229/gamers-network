
const {StatusCodes} = require('http-status-codes')
var { gameCover, getGame, autoComplete, randomGames, gamesList } = require('../util/games')

exports.random = async function (req, res, next) {
	res.status(StatusCodes.OK).send(randomGames())
}

exports.autoComplete = async function (req, res, next) {
	const { name } = req.query
	if(!name) {
		return res.status(StatusCodes.BAD_REQUEST).send('game name is missing')
	}
	res.status(StatusCodes.OK).send(autoComplete(decodeURI(name)))
}

exports.info = async function (req, res, next) {
	const { name } = req.query
	if(!name) {
		return res.status(StatusCodes.BAD_REQUEST).send('game name is missing')
	}
	const game = getGame(decodeURI(name))
	if(!game) {
		return res.sendStatus(StatusCodes.NOT_FOUND)
	}
	res.status(StatusCodes.OK).send(game)
}

exports.cover = async function (req, res, next) {
	const { name } = req.params
	if(!name) {
		return res.status(StatusCodes.BAD_REQUEST).send('game name is missing')
	}
	const cover = gameCover(decodeURI(name))
	if(!cover) {
		return res.sendStatus(StatusCodes.NOT_FOUND)
	}
	res.status(StatusCodes.OK).sendFile(cover)
}

exports.list = async function (req, res, next) {
	let { offset, length } = req.query
	// number of results
	if(length) {
		if(isNaN(length = parseInt(length)) || length > 100 || length <= 0) {
			return res.status(StatusCodes.BAD_REQUEST).send('\'length\' must be between 1 and 100')
		}
	} else {
		length = 10
	}
	// offset sorted list from index
	if(offset) {
		if(isNaN(offset = parseInt(offset)) || offset < 0) {
			return res.status(StatusCodes.BAD_REQUEST).send('\'offset\' must be a positive integer or 0')
		}
	} else {
		offset = 0
	}
	// get list of games
	return res.status(StatusCodes.OK).send(gamesList(offset, length))
}