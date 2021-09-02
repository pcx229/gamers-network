
var {Room, RoomMember} = require('../models/room')
var {Profile} = require('../models/profile')
var { StatusCodes } = require('http-status-codes')

const MAX_RESULTS_NUMBER = 100, DEFAULT_RESULTS_NUMBER = 10

exports.rooms = async function (req, res, next) {
	let { name, game, min_participates, max_participates, platform, skip, limit } = req.query

	let query = {}

	if(name) {
		query['name'] = {$regex: new RegExp(`${name}`, 'g')}
	}

	if(game) {
		query['game'] = {$eq: game}
	}

	if(min_participates && !isNaN(min_participates)) {
		query['members'] = {$gt: parseInt(min_participates)}
	}
	if(max_participates && !isNaN(max_participates)) {
		if(query['members']) {
			query['members']['$lt'] = parseInt(max_participates)
		} else {
			query['members'] = { $lt: parseInt(max_participates)}
		}
	}

	if(platform) {
		query['platform'] = {$eq: platform}
	}

	if(skip && !isNaN(skip)) {
		skip = parseInt(skip)
	} else {
		skip = 0
	}

	if(limit && !isNaN(limit)) {
		limit = parseInt(limit)
	} else {
		limit = DEFAULT_RESULTS_NUMBER
	}
	if(limit > MAX_RESULTS_NUMBER) {
		limit = MAX_RESULTS_NUMBER
	}

	let results = await Room.find(query).skip(skip).limit(limit).exec()

	return res.status(StatusCodes.OK).send(results)
}

exports.peoples = async function (req, res, next) {
	let { name, game, platform, country, skip, limit } = req.query

	let query = {}

	if(name) {
		query['name'] = {$regex: new RegExp(`${name}`, 'g')}
	}

	if(country) {
		query['country'] = {$eq: country}
	}

	if(skip && !isNaN(skip)) {
		skip = parseInt(skip)
	} else {
		skip = 0
	}

	if(limit && !isNaN(limit)) {
		limit = parseInt(limit)
	} else {
		limit = DEFAULT_RESULTS_NUMBER
	}
	if(limit > MAX_RESULTS_NUMBER) {
		limit = MAX_RESULTS_NUMBER
	}

	let results

	if(game || platform) {
		let gamePlatformMatch = {}
		if(game) {
			gamePlatformMatch['game'] = { $eq: game }
		}
		if(platform) {
			gamePlatformMatch['platform'] = { $eq: platform }
		}
		results = (await RoomMember
			.aggregate([
				{
					$lookup: {
						from: 'rooms',
						localField: 'roomId',
						foreignField: '_id',
						as: 'room'
					}
				},
				{
					$match: {
						room: {
							$elemMatch: gamePlatformMatch
						}
					}
				},
				{
					$project: {userId: 1}
				},
				{
					$group: {
						_id: {
							userId: '$userId'
						}
					}
				},
				{
					$replaceRoot: {
						newRoot: {
							userId: '$_id.userId'
						}
					}
				},
				{
					$unionWith: { 
						coll: 'profile_games', 
						pipeline: [ 
							{
								$match: {
									...gamePlatformMatch
								}
							},
							{ $project: { userId: 1 } },
							{
								$replaceRoot: {
									newRoot: {
										userId: '$userId'
									}
								}
							}
						]
					}
				},
				{
					$lookup: {
						from: 'profiles',
						localField: 'userId',
						foreignField: 'userId',
						as: 'profiles'
					}
				},
				{
					$project: { 
						'profile': { 
							$arrayElemAt: [ '$profiles', 0 ] 
						}
					}
				},
				{ 
					$replaceRoot: { 
						newRoot: '$profile' 
					} 
				},
				{
					$skip: skip
				},
				{
					$limit: limit
				}
			]))
	} else {
		results = await Profile.find(query).skip(skip).limit(limit).exec()
	}

	return res.status(StatusCodes.OK).send(results)
}