
var mongoose = require('mongoose'),
	autoIncrement = require('mongoose-auto-increment')
var SHA256 = require('crypto-js/sha256')
var random = require('random')
random.use(Math.random)

autoIncrement.initialize(mongoose.connection)

const roomSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	creator: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		require: true
	},
	game: {
		type: String,
		require: true
	},
	platform: {
		type: String,
		require: true
	},
	description: {
		type: String,
		require: false
	},
	private: {
		type: Boolean,
		default: false,
		require: false
	},
	members: {
		type: Number,
		default: 0
	}
}, { timestamps: true })

const roomMemberSchema = new mongoose.Schema({
	userId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		require: true
	},
	roomId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Room',
		require: true
	}
})
roomMemberSchema.index({ userId: 1, roomId: 1 }, { unique: true })
roomMemberSchema.plugin(autoIncrement.plugin, { model: 'Room_Member', field: 'seq' })

const roomScheduleSchema = new mongoose.Schema({
	roomId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Room'
	},
	fromDate: Date,
	toDate: Date
})
roomScheduleSchema.plugin(autoIncrement.plugin, { model: 'Room_Schedule', field: 'seq' })

const roomAnnouncementsSchema = new mongoose.Schema({
	roomId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Room'
	},
	message: String
})
roomAnnouncementsSchema.plugin(autoIncrement.plugin, { model: 'Room_Announcement', field: 'seq' })

const roomInvitesSchema = new mongoose.Schema({
	userId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User'
	},
	roomId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Room'
	},
	code: String,
	accepted: {
		type: Boolean,
		required: false
	}
})
roomInvitesSchema.methods.generateCode = function () {
	this.code = SHA256(String(random.float())).toString()
}
roomInvitesSchema.plugin(autoIncrement.plugin, { model: 'Room_Invite', field: 'seq' })

module.exports = {
	Room: mongoose.model('Room', roomSchema),
	RoomMember: mongoose.model('Room_Member', roomMemberSchema),
	RoomSchedule: mongoose.model('Room_Schedule', roomScheduleSchema),
	RoomAnnouncement: mongoose.model('Room_Announcement', roomAnnouncementsSchema),
	RoomInvite: mongoose.model('Room_Invite', roomInvitesSchema)
}