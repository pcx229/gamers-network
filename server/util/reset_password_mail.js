
var fs = require('fs')
var path = require('path')
const getMailTransporter = require('./mailer.config')
const {RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES} = require('../models/user')

async function sendResetPasswordMail(email, code) {
	// load mail format
	let mail = fs.readFileSync(path.join(__dirname, './reset-password-email.html'), 'utf8')
	mail = mail.replace(/{link_reset_password}/g, process.env.CLIENT_URL + '/reset-password/' + code)
	mail = mail.replace(/{link_contact_support}/g, process.env.CLIENT_URL + '/contact')
	mail = mail.replace(/{email}/g, email)
	mail = mail.replace(/{expire_time_minutes}/g, RESET_PASSWORD_LINK_EXPIRE_TIME_MINUTES)
	// send mail
	const transporter = getMailTransporter()
	if(transporter) {
		transporter.sendMail({
			from: `support <${process.env.SMTP_SUPPORT_RECEIPT}>`,
			to: email,
			subject: 'Your account password reset link',
			html: mail,
		})
	}
}

module.exports = {
	sendResetPasswordMail
}