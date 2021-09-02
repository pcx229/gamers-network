
var mongoose = require('mongoose'),
	autoIncrement = require('mongoose-auto-increment')
 
autoIncrement.initialize(mongoose.connection)

const chatSchema = new mongoose.Schema({
	message: String,
	from: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User'
	},
	to: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Room' 
	}
},
{
	timestamps: true
})

chatSchema.plugin(autoIncrement.plugin, { model: 'Chat', field: 'seq' })
module.exports = mongoose.model('Chat', chatSchema)