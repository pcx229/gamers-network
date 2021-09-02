
var mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
	name: String,
	email: String,
	acknowledge: {
		type: Boolean,
		default: false
	},
	message: String
},
{
	timestamps: true
})

module.exports = mongoose.model('Contact', contactSchema)