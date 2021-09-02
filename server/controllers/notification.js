
var {StatusCodes} = require('http-status-codes')
var mongoose = require('mongoose')
const User = require('../models/user')
const Notification = require('../models/notification')

exports.create = async function (req, res, next) {
	const userId = req.user.id
	const { toUserId, message } = req.body
	// check that the user exist
	let exist
	try {
		exist = await User.exists({ _id: new mongoose.Types.ObjectId(toUserId) })
	} catch(err) {
		exist = false
	}
	if(!exist) {
		return res.status(StatusCodes.BAD_REQUEST).send('user not found')
	}
	// add the message as notification
	const notification = new Notification({from: new mongoose.Types.ObjectId(userId), to: new mongoose.Types.ObjectId(toUserId), message})
	await notification.save()
	return res.sendStatus(StatusCodes.OK)
}

exports.list = async function (req, res, next) {
	const userId = req.user.id
	let { length, offset, notReadYet } = req.query
	// fetch all notifications in range
	let filter = {to: new mongoose.Types.ObjectId(userId)}
	// read
	if(notReadYet) {
		if(notReadYet === false || notReadYet === false) {
			filter.markAsRead = !notReadYet
		} else {
			return res.status(StatusCodes.BAD_REQUEST).send('\'notReadYet\' need to be a boolean')
		}
	}
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
	const list = await Notification.find(filter)
		.sort({ seq: 'desc' })
		.skip(offset)
		.limit(length)
		.exec()
	return res.status(StatusCodes.OK).send(list)
}

exports.mark = async function (req, res, next) {
	const userId = req.user.id
	const { listIds } = req.body
	// mark all notifications with the ids givin, if list is not defined then mark all
	let filter = {to: new mongoose.Types.ObjectId(userId)}
	if(listIds) {
		if(Array.isArray(listIds)) {
			for(const id of listIds) {
				if(typeof id !== 'string') {
					return res.status(StatusCodes.BAD_REQUEST).send('\'listIds\' need to be an array of ids')
				}
			}
		}
		filter._id = {$in:listIds.map(id => new mongoose.Types.ObjectId(id))}
	}
	await Notification.updateMany(filter, {markAsRead: true}).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.remove = async function (req, res, next) {
	const userId = req.user.id
	const { listIds } = req.body
	// remove all notifications with the ids givin, if list is not defined then remove all
	let filter = {to: new mongoose.Types.ObjectId(userId)}
	if(listIds) {
		if(Array.isArray(listIds)) {
			for(const id of listIds) {
				if(typeof id !== 'string') {
					return res.status(StatusCodes.BAD_REQUEST).send('\'listIds\' need to be an array of ids')
				}
			}
		}
		filter._id = {$in:listIds.map(id => new mongoose.Types.ObjectId(id))}
	}
	await Notification.deleteMany(filter).exec()
	return res.sendStatus(StatusCodes.OK)
}