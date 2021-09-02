
var mongoose = require('mongoose'),
	autoIncrement = require('mongoose-auto-increment')

autoIncrement.initialize(mongoose.connection)

const profileSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: true
	},
	name: String,
	email: String,
	image: String,
	birthday: Date,
	country: String,
	status: String
})

const profileGamesSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	game: String,
	platform: String
})
profileGamesSchema.plugin(autoIncrement.plugin, { model: 'Profile_Game', field: 'seq' })

const profileFriendsSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	friend: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
})
profileFriendsSchema.plugin(autoIncrement.plugin, { model: 'Profile_Friend', field: 'seq' })

module.exports = {
	Profile: mongoose.model('Profile', profileSchema),
	ProfileGame: mongoose.model('Profile_Game', profileGamesSchema),
	ProfileFriend: mongoose.model('Profile_Friend', profileFriendsSchema)
}