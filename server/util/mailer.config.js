'use strict'
const nodemailer = require('nodemailer')

let transporter = undefined

if(process.env.SMTP_EXIST && process.env.SMTP_EXIST != 'false') {
	transporter = nodemailer.createTransport({
		host: process.env.SMTP_SERVER,
		port: process.env.SMTP_PORT,
		secure: false
	})
}

function getMailTransporter() {
	return transporter
}

module.exports = getMailTransporter