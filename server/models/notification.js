
var mongoose = require('mongoose'),
	autoIncrement = require('mongoose-auto-increment')

autoIncrement.initialize(mongoose.connection)

const notificationSchema = new mongoose.Schema({
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		require: true
	},
	to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		require: true
	},
	message: String,
	markAsRead: {
		type: Boolean,
		default: false,
		require: false
	}
}, { timestamps: true })
notificationSchema.plugin(autoIncrement.plugin, { model: 'Notification', field: 'seq' })

module.exports = mongoose.model('Notification', notificationSchema)