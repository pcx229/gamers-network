
const {StatusCodes} = require('http-status-codes')
var mongoose = require('mongoose')
const Chat = require('../models/chat')
var { Room, RoomMember, RoomSchedule, RoomAnnouncement, RoomInvite } = require('../models/room')
const User = require('../models/user')
//var Notification = require('../models/notification')
var Joi = require('joi')
const {hasGame} = require('../util/games')

exports.listInvite = async function (req, res, next) {
	const { roomId } = req.query
	// get list of invites
	let invites = await RoomInvite.aggregate()
		.match({
			roomId: new mongoose.Types.ObjectId(roomId)
		})
		.lookup({
			from: 'profiles',
			localField: 'userId',
			foreignField: 'userId',
			as: 'profile'
		})
		.lookup({
			from: 'users',
			localField: 'userId',
			foreignField: '_id',
			as: 'user'
		})
		.sort({ seq: 'desc' })
		.exec()
	invites = invites.map(m => {
		return {
			id: m._id,
			userId: m.userId,
			email: m.user[0].email,
			name: m.profile[0].name,
			image: m.profile[0].image,
			code: m.code,
			accepted: m.accepted
		}
	})
	return res.status(StatusCodes.OK).send(invites)
}

exports.hasInvite = async function (req, res, next) {
	return res.sendStatus(StatusCodes.OK)
}

exports.addInvite = async function (req, res, next) {
	//const ownerUserId = req.user.id
	const { roomId } = req.query
	const { userEmail } = req.body
	// add invite to room
	const user = await User.findOne({ email: userEmail }).exec()
	if(user) {
		let invite = new RoomInvite({ roomId: new mongoose.Types.ObjectId(roomId), userId: new mongoose.Types.ObjectId(user._id) })
		invite.generateCode()
		await invite.save()
		// send invite notification
		//const notification = new Notification({from: new mongoose.Types.ObjectId(ownerUserId), to: new mongoose.Types.ObjectId(user._id), message: `You are invited to join this room <a href="${'/invite/' + invite.roomId + '/' + invite.code}">Click here to accept</a>`})
		//await notification.save()
		return res.sendStatus(StatusCodes.OK)
	} else {
		return res.status(StatusCodes.BAD_REQUEST).send('user with that email not found')
	}
}

exports.removeInvite = async function (req, res, next) {
	const { roomId } = req.query
	const { inviteId } = req.body
	// remove invite from room
	if ((await RoomInvite.deleteOne({ _id: inviteId, roomId }).exec()).n !== 1) {
		return res.status(StatusCodes.BAD_REQUEST).send('invite dose not exist')
	}
	return res.sendStatus(StatusCodes.OK)
}

exports.ackInvite = async function (req, res, next) {
	const userId = req.user.id
	const { roomId, code } = req.query
	const { accepted } = req.body
	// update status
	if(accepted === undefined || (accepted !== true && accepted !== false)) {
		return res.status(StatusCodes.BAD_REQUEST).send('missing parameters')
	}
	await RoomInvite.updateOne({ roomId: new mongoose.Types.ObjectId(roomId), userId: new mongoose.Types.ObjectId(userId), code }, {accepted}).exec()
	if(accepted) {
		const member = new RoomMember({ userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId) })
		try {
			await member.save()
		} catch(err) {
			// ignore
		}
	}
	return res.sendStatus(StatusCodes.OK)
}

// should be used in conjecture with roomExistMiddleware and ensureLoggedIn
exports.userHaveInviteToThisRoomMiddleware = async function (req, res, next) {
	const userId = req.user.id
	const { roomId, code } = req.query
	let exist
	try {
		exist = await RoomInvite.exists({ userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId), code, accepted: {$exists: false} })
	} catch (err) {
		exist = false
	}
	if(!exist) {
		return res.status(StatusCodes.FORBIDDEN).send('user have no invite to this room')
	}
	next()
}

exports.listSchedules = async function (req, res, next) {
	const { roomId } = req.query
	// get list of schedule
	const schedules = await RoomSchedule.find({ roomId: new mongoose.Types.ObjectId(roomId) })
		.sort({ seq: 'desc' })
		.exec()
	return res.status(StatusCodes.OK).send(schedules)
}

exports.addSchedule = async function (req, res, next) {
	const { roomId } = req.query
	const { fromDate, toDate } = req.body
	// add schedule to room
	const schedule = new RoomSchedule({ roomId: new mongoose.Types.ObjectId(roomId), fromDate, toDate })
	await schedule.save()
	return res.sendStatus(StatusCodes.OK)
}

exports.removeSchedule = async function (req, res, next) {
	const { roomId } = req.query
	const { scheduleId } = req.body
	// remove schedule from room
	if ((await RoomSchedule.deleteOne({ roomId: new mongoose.Types.ObjectId(roomId), _id: new mongoose.Types.ObjectId(scheduleId) }).exec()).n !== 1) {
		return res.status(StatusCodes.BAD_REQUEST).send('schedule dose not exist')
	}
	return res.sendStatus(StatusCodes.OK)
}

// should be used in conjecture with userIsRoomMemberMiddleware and ensureLoggedIn
exports.userIsNotRoomOwnerMiddleware = async function (req, res, next) {
	const userId = req.user.id
	const { roomId } = req.query
	let exist
	try {
		exist = await Room.exists({ creator: new mongoose.Types.ObjectId(userId), _id: new mongoose.Types.ObjectId(roomId) })
	} catch (err) {
		exist = false
	}
	if (exist) {
		return res.status(StatusCodes.FORBIDDEN).send('user is the owner of this room')
	}
	next()
}

// should be used in conjecture with userIsRoomMemberMiddleware and ensureLoggedIn
exports.userIsRoomOwnerMiddleware = async function (req, res, next) {
	const userId = req.user.id
	const { roomId } = req.query
	let exist
	try {
		exist = await Room.exists({ creator: new mongoose.Types.ObjectId(userId), _id: new mongoose.Types.ObjectId(roomId) })
	} catch (err) {
		exist = false
	}
	if (!exist) {
		return res.status(StatusCodes.FORBIDDEN).send('user is not the owner of this room')
	}
	next()
}

exports.listAnnouncements = async function (req, res, next) {
	const { roomId } = req.query
	// get list of announcement
	const announcements = await RoomAnnouncement.find({ roomId: new mongoose.Types.ObjectId(roomId) })
		.sort({ seq: 'desc' })
		.exec()
	return res.status(StatusCodes.OK).send(announcements)
}

exports.addAnnouncement = async function (req, res, next) {
	const { roomId } = req.query
	const { message } = req.body
	// add announcement to room
	const announcement = new RoomAnnouncement({ roomId: new mongoose.Types.ObjectId(roomId), message })
	await announcement.save()
	return res.sendStatus(StatusCodes.OK)
}

exports.removeAnnouncement = async function (req, res, next) {
	const { roomId } = req.query
	const { announcementId } = req.body
	// remove announcement from room
	if ((await RoomAnnouncement.deleteOne({ roomId: new mongoose.Types.ObjectId(roomId), _id: new mongoose.Types.ObjectId(announcementId) }).exec()).n !== 1) {
		return res.status(StatusCodes.BAD_REQUEST).send('announcement dose not exist')
	}
	return res.sendStatus(StatusCodes.OK)
}

exports.roomExistMiddleware = async function (req, res, next) {
	const { roomId } = req.query
	if (!roomId) {
		return res.status(StatusCodes.BAD_REQUEST).send('no specified room id')
	}
	let exist
	try {
		exist = await Room.exists({ _id: new mongoose.Types.ObjectId(roomId) })
	} catch (err) {
		exist = false
	}
	if (!exist) {
		return res.status(StatusCodes.BAD_REQUEST).send('room not found')
	}
	next()
}

// should be used in conjecture with roomExistMiddleware and ensureLoggedIn
exports.userIsRoomMemberMiddleware = async function (req, res, next) {
	const userId = req.user.id
	const { roomId } = req.query
	let exist
	try {
		exist = await RoomMember.exists({ userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId) })
	} catch (err) {
		exist = false
	}
	if (!exist) {
		return res.status(StatusCodes.FORBIDDEN).send('user is not a member of this room')
	}
	next()
}

// should be used in conjecture with roomExistMiddleware
exports.userAccessToPrivateRoomMiddleware = async function (req, res, next) {
	const { roomId } = req.query
	let isPrivate
	try {
		isPrivate = await Room.exists({ _id: new mongoose.Types.ObjectId(roomId), private: true })
	} catch (err) {
		isPrivate = false
	}
	if(isPrivate) {
		let exist
		if(req.user) {
			try {
				exist = await RoomMember.exists({ userId: new mongoose.Types.ObjectId(req.user.id), roomId: new mongoose.Types.ObjectId(roomId) })
			} catch (err) {
				exist = false
			}
		}
		if (!exist) {
			return res.status(StatusCodes.FORBIDDEN).send('user have no access permissions to this room')
		}
	}
	next()
}

// should be used in conjecture with roomExistMiddleware and ensureLoggedIn
exports.userIsNotRoomMemberMiddleware = async function (req, res, next) {
	const userId = req.user.id
	const { roomId } = req.query
	let exist
	try {
		exist = await RoomMember.exists({ userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId) })
	} catch (err) {
		exist = false
	}
	if (exist) {
		return res.status(StatusCodes.FORBIDDEN).send('user is a member of this room')
	}
	next()
}

exports.isMember = async function (req, res, next) {
	return res.sendStatus(StatusCodes.OK)
}


exports.listMembers = async function (req, res, next) {
	const { roomId } = req.query
	// get list of members
	let members = await RoomMember.aggregate()
		.match({
			roomId: new mongoose.Types.ObjectId(roomId)
		})
		.lookup({
			from: 'profiles',
			localField: 'userId',
			foreignField: 'userId',
			as: 'profile'
		})
		.lookup({
			from: 'users',
			localField: 'userId',
			foreignField: '_id',
			as: 'user'
		})
		.sort({ seq: 'desc' })
		.exec()
	members = members.map(m => {
		return {
			userId: m.userId,
			email: m.user[0].email,
			name: m.profile[0].name,
			image: m.profile[0].image
		}
	})
	return res.status(StatusCodes.OK).send(members)
}

exports.addMember = async function (req, res, next) {
	const userId = req.user.id
	const {roomId} = req.query
	// add member to room
	const member = new RoomMember({userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId)})
	await member.save()
	// update room members count
	await Room.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(roomId) }, {$inc : {members : 1}}).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.removeMember = async function (req, res, next) {
	const userId = req.user.id
	const {roomId} = req.query
	// remove member from room
	await RoomMember.deleteOne({userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId)}).exec()
	// update room members count
	await Room.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(roomId) }, {$inc : {members : -1}}).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.kickMember = async function (req, res, next) {
	const ownerUserId = req.user.id
	const { roomId } = req.query
	const { userId } = req.body
	// creator cannot kick himself
	const room = await Room.findOne({ _id: new mongoose.Types.ObjectId(roomId) })
	if(room.creator === userId) {
		res.status(StatusCodes.BAD_REQUEST).send('room creator cannot kick himself')
	}
	// remove member from room
	await RoomMember.deleteOne({ userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId) }).exec()
	// message info to user
	//const notification = new Notification({from: new mongoose.Types.ObjectId(ownerUserId), to: new mongoose.Types.ObjectId(userId), message: `You have been kicked from room ${room.name} [id: ${room._id}]`})
	//await notification.save()
	// update room members count
	await Room.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(roomId) }, {$inc : {members : -1}}).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.listAll = async function (req, res, next) {
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
	// get list of rooms
	const rooms = await Room.find({}).sort('createdAt').skip(offset).limit(length).exec()
	return res.status(StatusCodes.OK).send(rooms)
}

exports.list = async function (req, res, next) {
	let {userId} = req.query
	if(userId) {
		// check if user exist
		let exist
		try {
			exist = await User.exists({ _id: new mongoose.Types.ObjectId(userId) })
		} catch(err) {
			exist = false
		}
		if(!exist) {
			return res.status(StatusCodes.BAD_REQUEST).send('user not found')
		}
	} else {
		userId = req.user ? req.user.id : undefined
		// check if user logged in
		if(!userId) {
			return res.status(StatusCodes.BAD_REQUEST).send('no specified user id')
		}
	}
	// get list of rooms
	const rooms = (await RoomMember.find({ userId: new mongoose.Types.ObjectId(userId) }).populate('roomId').exec()).map(m => m.roomId)
	return res.status(StatusCodes.OK).send(rooms)
}

exports.select = async function (req, res, next) {
	const {roomId} = req.query
	if(roomId) {
		let room
		try {
			room = await Room.findById(roomId)
		} catch(err) { 
			// handle error later
		}
		if(!room) {
			return res.status(StatusCodes.BAD_REQUEST).send('room not found')
		}
		return res.status(StatusCodes.OK).send(room)
	}
	return res.status(StatusCodes.BAD_REQUEST).send('no specified room id')
}

exports.create = async function (req, res, next) {
	const userId = req.user.id
	let { name, game, platform, description, private } = req.body
	// validate input
	try {
		const name_validator = Joi.string().min(3).max(64).pattern(/^[a-zA-Z0-9][a-zA-Z0-9 -_'+]+$/)
		Joi.attempt(name, name_validator)
		if (!hasGame(game)) {
			throw new Error('game not found')
		}
		const platform_validator = Joi.string().pattern(/^Pc|Xbox|Playstation|Android|Apple|Psp$/)
		Joi.attempt(platform, platform_validator)
		if (!description) {
			description = ''
		} else {
			const description_validator = Joi.string().max(256)
			Joi.attempt(description, description_validator)
		}
		if(private !== undefined && private !== true && private !== false) {
			throw new Error('invalid private field')
		}
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).send('name, game, platform, description or private are not formatted correctly')
	}
	// create room
	let room = new Room({ name, creator: new mongoose.Types.ObjectId(userId), game, platform, description, private: (private === true), members: 1 })
	room = await room.save()
	// add creator as a member to the room
	const member = new RoomMember({ roomId: room._id, userId: new mongoose.Types.ObjectId(userId) })
	await member.save()
	res.status(StatusCodes.OK).send(room._id)
}

exports.edit = async function (req, res, next) {
	const userId = req.user.id
	const { roomId } = req.query
	const { name, game, platform, description, private } = req.body
	// make sure the user is the owner of the room
	let exist
	try {
		exist = await Room.exists({ _id: new mongoose.Types.ObjectId(roomId), creator: new mongoose.Types.ObjectId(userId) })
	} catch (err) {
		// handle error later
	}
	if (!exist) {
		return res.status(StatusCodes.FORBIDDEN).send('room dose not exist or user have no permission to delete it')
	}
	// validate input
	let update = {}
	try {
		if (name) {
			const name_validator = Joi.string().min(3).max(64).pattern(/^[a-zA-Z0-9][a-zA-Z0-9 -_'+]+$/)
			Joi.attempt(name, name_validator)
			update.name = name
		}
		if (game) {
			if (!hasGame(game)) {
				throw new Error('game not found')
			}
			update.game = game
		}
		if (platform) {
			const platform_validator = Joi.string().pattern(/^Pc|Xbox|Playstation|Android|Apple|Psp$/)
			Joi.attempt(platform, platform_validator)
			update.platform = platform
		}
		if (description) {
			const description_validator = Joi.string().max(256)
			Joi.attempt(description, description_validator)
			update.description = description
		}
		if(private !== undefined) {
			if(private !== true && private !== false) {
				throw new Error('invalid private field')
			} else {
				update.private = (private === true)
			}
		}
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).send('name, game, platform, description or private are not formatted correctly')
	}
	// make changes
	if(update.private === false) {
		await RoomInvite.deleteMany({ roomId: new mongoose.Types.ObjectId(roomId) }).exec()
	}
	await Room.updateOne({ _id: new mongoose.Types.ObjectId(roomId) }, update).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.remove = async function (req, res, next) {
	const userId = req.user.id
	const {roomId} = req.query
	// make sure the user is the owner of the room
	let exist
	try {
		exist = await Room.exists({ _id: new mongoose.Types.ObjectId(roomId), creator: new mongoose.Types.ObjectId(userId) })
	} catch(err) { 
		// handle error later
	}
	if(!exist) {
		return res.status(StatusCodes.FORBIDDEN).send('room dose not exist or user have no permission to delete it')
	}
	// delete room
	await Room.deleteOne({ _id: new mongoose.Types.ObjectId(roomId) }).exec()
	await RoomMember.deleteMany({ roomId: new mongoose.Types.ObjectId(roomId) }).exec()
	await RoomSchedule.deleteMany({ roomId: new mongoose.Types.ObjectId(roomId) }).exec()
	await RoomAnnouncement.deleteMany({ roomId: new mongoose.Types.ObjectId(roomId) }).exec()
	await RoomInvite.deleteMany({ roomId: new mongoose.Types.ObjectId(roomId) }).exec()
	await Chat.deleteMany({ to: new mongoose.Types.ObjectId(roomId) }).exec()
	return res.sendStatus(StatusCodes.OK)
}

exports.chat = (io) => {

	function messagesChatInfo(msgs) {
		if(!msgs) {
			return []
		}
		return msgs.map(m => {
			return {
				name: m.profile[0].name,
				image: m.profile[0].image,
				message: m.message,
				userId: m.from,
				seq: m.seq,
				time: m.createdAt,
				id: m._id
			}
		})
	}

	io.on('connection', async (socket) => {
		const userId = socket.request.user ? socket.request.user.id : undefined
		const roomId = socket.handshake.query.room

		let exist, access = false, permission = false
		try {
			// check if room exist
			exist = await Room.exists({ _id: new mongoose.Types.ObjectId(roomId) })
			// check if room is private
			access = await Room.exists({ _id: new mongoose.Types.ObjectId(roomId), private: true })
			// check if user have permission to use room
			permission = await RoomMember.exists({ userId: new mongoose.Types.ObjectId(userId), roomId: new mongoose.Types.ObjectId(roomId) })
		} catch (err) {
			// handle error later
		}
		if (!exist || (access && !permission)) {
			socket.disconnect()
			return
		}
		socket.join(roomId)
		
		// notify user of other members connected
		if(userId && permission) {
			socket.data.trackMemberActive = true
			socket.data.trackMemberActiveUserId = userId
			io.to(roomId).emit('user-joined', userId)
			socket.on('disconnect', () => {
				io.to(roomId).emit('user-left', userId)
			})
		}
		io.in(roomId).fetchSockets()
			.then((sockets) => {
				let userIds = []
				for(const socket of sockets) {
					if(socket.data.trackMemberActive) {
						const socketUserId = socket.data.trackMemberActiveUserId
						if(userId !== socketUserId) {
							userIds.push(socketUserId)
						}
					}
				}
				socket.emit('user-joined', userIds)
			})

		// send last 10 messages
		const msgs = await Chat.aggregate()
			.match({
				to: new mongoose.Types.ObjectId(roomId)
			}).lookup({
				from: 'profiles',
				localField: 'from',
				foreignField: 'userId',
				as: 'profile'
			})
			.sort({seq: 'desc'})
			.limit(20)
			.exec()
		socket.emit('message', messagesChatInfo(msgs))

		// receive message
		if((permission)) {
			socket.emit('status', 'allowed to chat')
			socket.on('message', async (msg, fn) => {
				// save message in database
				msg = new Chat({message: msg, from: new mongoose.Types.ObjectId(userId), to:  new mongoose.Types.ObjectId(roomId)})
				msg = await msg.save()
				msg = await Chat.aggregate()
					.match({
						_id: new mongoose.Types.ObjectId(msg._id)
					}).lookup({
						from: 'profiles',
						localField: 'from',
						foreignField: 'userId',
						as: 'profile'
					})
					.exec()
				// send message to all listeners
				io.to(roomId).emit('message', messagesChatInfo(msg))
				fn('done')
			})
		} else {
			socket.emit('status', 'not allowed to chat')
		}

		socket.on('more', async (index) => {
			// send more messages to this client from index
			const msgs = await Chat.aggregate()
				.match({
					seq: {$lt: index},
					to: new mongoose.Types.ObjectId(roomId)
				}).lookup({
					from: 'profiles',
					localField: 'from',
					foreignField: 'userId',
					as: 'profile'
				})
				.sort({seq: 'desc'})
				.limit(20)
				.exec()
			socket.emit('more', messagesChatInfo(msgs))
		})
	})
}