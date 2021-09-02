
var { StatusCodes } = require('http-status-codes')
var Contact = require('../models/contact')
var Joi = require('joi')

exports.contact = async function (req, res, next) {
	const { message, name, email } = req.body
	// validate input
	try {
		const name_validator = Joi.string().min(3).max(64)
		Joi.attempt(name, name_validator)
		const email_validator = Joi.string().email()
		Joi.attempt(email, email_validator)
		const message_validator = Joi.string().min(1).max(1024)
		Joi.attempt(message, message_validator)
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).send('name, email or message are not formatted correctly')
	}
	// commit
	try {
		let contact = new Contact({ message, name, email })
		await contact.save()
		return res.status(StatusCodes.OK).send('message was sent')
	} catch (err) {
		return next(err)
	}
}

exports.all = async function (req, res, next) {
	let { acknowledge, from_date, to_date } = req.query
	// filter contacts
	let search = {}
	if(acknowledge !== undefined) {
		search.acknowledge = (acknowledge === 'true')
	}
	if(from_date !== undefined) {
		search.createdAt = { $gte: from_date }
	}
	if(to_date !== undefined) {
		search.createdAt = { $lte: to_date }
	}
	// search by filter
	try {
		const allContact = await Contact.find(search).exec()
		return res.status(StatusCodes.OK).send(allContact)
	} catch (err) {
		return next(err)
	}
}

exports.acknowledge = async function (req, res, next) {
	const { id } = req.query
	if(!id) {
		return res.status(StatusCodes.BAD_REQUEST).send('contact id is missing')
	}
	try {
		await Contact.updateOne({ _id: id }, { acknowledge: true }).exec()
		return res.status(StatusCodes.OK).send(`contact ${id} was acknowledged`)
	} catch (err) {
		return next(err)
	}
}