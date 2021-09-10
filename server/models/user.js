
var mongoose = require('mongoose')
var SHA256 = require('crypto-js/sha256')
var random = require('random')
var randomstring = require('randomstring')
random.use(Math.random)

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		require: true,
		unique: true
	},
	password:  {
		type: String,
		require: true
	},
	salt: {
		type: String,
		require: true
	}
})

userSchema.methods.validPassword = function (password) {
	const real = this.password,
		attempt = SHA256(password + this.salt).toString()
	return (real.localeCompare(attempt) === 0)
}

userSchema.methods.setPassword = function (password) {
	this.salt = SHA256(String(random.float())).toString()
	this.password = SHA256(password + this.salt).toString()
}

let User = mongoose.model('User', userSchema)

// passportjs auth
User.authenticate = function (email, password, done) {
	User.findOne({ email }, function (err, user) {
		if (err) {
			return done(err)
		}
		if (!user) {
			return done(null, false, { message: 'incorrect email' })
		}
		if (!user.validPassword(password)) {
			return done(null, false, { message: 'incorrect password' })
		}
		return done(null, user)
	})
}
User.serializeUser = function (user, done) {
	done(null, JSON.stringify({ email: user.email, id: user._id }))
}
User.deserializeUser = function (user, done) {
	done(null, JSON.parse(user))
}

const RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES = 30
const RESET_PASSWORD_CODE_LENGTH = 64

const userPasswordResetSchema = new mongoose.Schema({
	userId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		require: true
	},
	email: {
		type: String,
		require: true
	},
	code: {
		type: String,
		require: true
	}
})

userPasswordResetSchema.methods.generateCode = function () {
	this.code = randomstring.generate(RESET_PASSWORD_CODE_LENGTH)
}

userPasswordResetSchema.index({ 'createdAt': 1 }, { expireAfterSeconds: RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES * 60 })

module.exports = {
	User,
	PasswordReset: mongoose.model('Password_Reset', userPasswordResetSchema),
	RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES,
	RESET_PASSWORD_CODE_LENGTH
}