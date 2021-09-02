
const {Profile, ProfileGame, ProfileFriend} = require('../models/profile')
const {StatusCodes} = require('http-status-codes')
var Joi = require('joi')
var mongoose = require('mongoose')
const {hasGame} = require('../util/games')

exports.profileExistsMiddleware = async function (req, res, next) {
	const {userId} = req.query
	if(!userId) {
		if(!req.user) {
			return res.status(StatusCodes.BAD_REQUEST).send('no specified user id')
		}
		req.query.userId = req.user.id
		return next()
	}
	let exist
	try {
		exist = await Profile.exists({userId: new mongoose.Types.ObjectId(userId)})
	} catch(err) {
		exist = false
	}
	if(!exist) {
		return res.status(StatusCodes.BAD_REQUEST).send('user not found')
	}
	next()
}

exports.getImage = async function (req, res, next) {
	const {userId} = req.params
	if(userId) {
		let profile
		try {
			profile = await Profile.findOne({userId: new mongoose.Types.ObjectId(userId)})
		} catch(err) { 
			// handle error later
		}
		if(!profile) {
			return res.sendStatus(StatusCodes.NOT_FOUND)
		}
		return res.redirect(profile.image)
	}
	return res.status(StatusCodes.BAD_REQUEST).send('no specified user id')
}

exports.select = async function (req, res, next) {
	const {userId} = req.query
	const profile = await Profile.findOne({userId: new mongoose.Types.ObjectId(userId)})
	return res.status(StatusCodes.OK).send(profile)
}

exports.edit = async function (req, res, next) {
	const userId = req.user.id
	const {image, name, birthday, country, status} = req.body
	// validate input
	let update = {}
	try {
		if(name) {
			const name_validator = Joi.string().min(3).max(64).pattern(/^[a-zA-Z0-9][a-zA-Z0-9 -_'+]+$/)
			Joi.attempt(name, name_validator)
			update.name = name
		}
		if(image) {
			const image_validator = Joi.string().uri()
			Joi.attempt(image, image_validator)
			update.image = image
		}
		if(birthday) {
			const birthday_validator = Joi.date()
			Joi.attempt(birthday, birthday_validator)
			update.birthday = birthday
		}
		if(country) {
			const country_validator = Joi.string().max(256)
			Joi.attempt(country, country_validator)
			update.country = country
		}
		if(status) {
			const status_validator = Joi.string().max(256)
			Joi.attempt(status, status_validator)
			update.status = status
		}
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).send('image, name, birthday, country or status are not formatted correctly')
	}
	// make changes
	await Profile.updateOne({ userId: new mongoose.Types.ObjectId(userId) }, update).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.listGames = async function (req, res, next) {
	const {userId} = req.query
	// get list of games
	const games = await ProfileGame.find({ userId: new mongoose.Types.ObjectId(userId) })
		.sort({seq: 'desc'})
		.exec()
	return res.status(StatusCodes.OK).send(games)
}

exports.addGame = async function (req, res, next) {
	const userId = req.user.id
	const {name, platform} = req.body
	// validate input
	if(!hasGame(name)) {
		return res.status(StatusCodes.BAD_REQUEST).send('game not found')
	}
	try {
		if(!platform) {
			throw new Error('platform is required')
		}
		const platform_validator = Joi.string().pattern(/^Pc|Xbox|Playstation|Android|Apple|Psp$/)
		Joi.attempt(platform, platform_validator)
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).send('platform not found')
	}
	// add game to profile
	const game = new ProfileGame({userId: new mongoose.Types.ObjectId(userId), game: name, platform: platform})
	await game.save()
	return res.sendStatus(StatusCodes.OK)
}

exports.removeGame = async function (req, res, next) {
	const userId = req.user.id
	const {gameId} = req.body
	// remove schedule from room
	try {
		if((await ProfileGame.deleteOne({userId: new mongoose.Types.ObjectId(userId), _id: new mongoose.Types.ObjectId(gameId)}).exec()).n !== 1) {
			throw new Error('game not found')
		}
	} catch(err) {
		return res.status(StatusCodes.BAD_REQUEST).send('game not found')
	}
	return res.sendStatus(StatusCodes.OK)
}

exports.listFriends = async function (req, res, next) {
	const {userId} = req.query
	// get list of friends
	const friends = (await ProfileFriend.aggregate()
		.match({ userId: new mongoose.Types.ObjectId(userId) })
		.lookup({
			from: 'profiles', 
			localField: 'friend', 
			foreignField: 'userId', 
			as: 'friend'
		})
		.sort({seq: 'desc'})
		.exec())
		.map(f => {
			return {
				_id: f._id,
				userId: f.friend[0].userId,
				name: f.friend[0].name,
				image: f.friend[0].image,
				email: f.friend[0].email
			}
		})
	return res.status(StatusCodes.OK).send(friends)
}

exports.addFriend = async function (req, res, next) {
	const userId = req.user.id
	const {friendUserEmail} = req.body
	// add friend to profile
	let exist
	let friendUserId
	try {
		const found = await Profile.findOne({email: friendUserEmail})
		if(found) {
			friendUserId = found.userId
			exist = true
		} else {
			exist = false
		}
	} catch(err) {
		// handle error later
	}
	if(!exist) {
		return res.status(StatusCodes.BAD_REQUEST).send('friend not found')
	}
	const friend = new ProfileFriend({userId: new mongoose.Types.ObjectId(userId), friend: new mongoose.Types.ObjectId(friendUserId)})
	await friend.save()
	return res.sendStatus(StatusCodes.OK)
}

exports.removeFriend = async function (req, res, next) {
	const userId = req.user.id
	const {friendId} = req.body
	// remove friend from profile
	try {
		if((await ProfileFriend.deleteOne({userId: new mongoose.Types.ObjectId(userId), _id: friendId}).exec()).n !== 1) {
			throw new Error('friend not found')
		}
	} catch(err) {
		return res.status(StatusCodes.BAD_REQUEST).send('friend not found')
	}
	return res.sendStatus(StatusCodes.OK)
}

exports.autoComplete = async function (req, res, next) {
	const { email } = req.query
	if(!email) {
		return res.status(StatusCodes.BAD_REQUEST).send('profile email is missing')
	}
	const results = await Profile.find({email: {$regex: new RegExp(`^${email}`, 'g')}}).limit(5)
	res.status(StatusCodes.OK).send(results)
}