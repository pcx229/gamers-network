
var fs = require('fs')
var path = require('path')
var randomstring = require('randomstring')
const getMailTransporter = require('./mailer.config')

const RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES = 30
const RESET_PASSWORD_CODE_LENGTH = 64
let reset_password_links = []

function addPasswordResetLink(email, code) {
	reset_password_links.push({
		email,
		code,
		expire: Date.now() + RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES * 60 * 1000
	})
}
function removePasswordResetLink(code) {
	let i = reset_password_links.findIndex(v => v.code === code)
	if (i !== -1) {
		reset_password_links.splice(i, 1)
	}
}
function hasPasswordResetLink(code) {
	let i = reset_password_links.findIndex(v => v.code === code)
	if (i !== -1) {
		return reset_password_links[i].email
	}
}
setInterval(function () {
	const now = Date.now()
	reset_password_links = reset_password_links.filter(v => v.expire > now)
}, RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES * 60 * 1000)

async function sendResetPasswordMail(email) {
	const code = randomstring.generate(RESET_PASSWORD_CODE_LENGTH)
	addPasswordResetLink(email, code)
	console.log('code:' + code)
	let mail = fs.readFileSync(path.join(__dirname, './reset-password-email.html'), 'utf8')
	mail.replace(/{link_reset_password}/g, process.env.CLIENT_URL + '/rest-password?code=' + code)
	mail.replace(/{link_contact_support}/g, process.env.CLIENT_URL + '/contact')
	mail.replace(/{email}/g, email)
	mail.replace(/{expire_time_minutes}/g, RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES)
	const transporter = getMailTransporter()
	if(transporter) {
		transporter.sendMail({
			from: `support <no@reply>`,
			to: email,
			subject: 'Your account password reset link',
			html: mail,
		})
	}
}

module.exports = {
	sendResetPasswordMail,
	hasPasswordResetLink,
	removePasswordResetLink
}