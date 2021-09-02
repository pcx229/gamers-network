
var express = require('express')
var router = express.Router()
var {ensureLoggedIn} = require('../util/ensureAuth')

var { 
	list, listAll, select, create, edit, remove, 
	isMember, listMembers, addMember, removeMember, roomExistMiddleware, userIsRoomMemberMiddleware, userAccessToPrivateRoomMiddleware, userIsNotRoomMemberMiddleware, 
	listAnnouncements, addAnnouncement, removeAnnouncement, userIsRoomOwnerMiddleware, userIsNotRoomOwnerMiddleware, 
	listSchedules, addSchedule, removeSchedule,
	listInvite, hasInvite, addInvite, ackInvite, removeInvite, kickMember, userHaveInviteToThisRoomMiddleware
} = require('../controllers/room')

router.get('/list-all', listAll)
router.get('/list', list)
router.get('/', select)
router.post('/', ensureLoggedIn(), create)
router.put('/', ensureLoggedIn(), edit)
router.delete('/', ensureLoggedIn(), remove)
router.get('/is-member', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, isMember)
router.get('/members', roomExistMiddleware, userAccessToPrivateRoomMiddleware, listMembers)
router.post('/members', ensureLoggedIn(), roomExistMiddleware, userIsNotRoomMemberMiddleware, addMember)
router.delete('/members', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsNotRoomOwnerMiddleware, removeMember)
router.delete('/members/kick', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, kickMember)
router.get('/announcements', roomExistMiddleware, userAccessToPrivateRoomMiddleware, listAnnouncements)
router.post('/announcements', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, addAnnouncement)
router.delete('/announcements', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, removeAnnouncement)
router.get('/schedule', roomExistMiddleware, userAccessToPrivateRoomMiddleware, listSchedules)
router.post('/schedule', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, addSchedule)
router.delete('/schedule', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, removeSchedule)
router.get('/invites/list', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, listInvite)
router.get('/invites', ensureLoggedIn(), roomExistMiddleware, userHaveInviteToThisRoomMiddleware, hasInvite)
router.post('/invites', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, addInvite)
router.put('/invites', ensureLoggedIn(), roomExistMiddleware, userHaveInviteToThisRoomMiddleware, ackInvite)
router.delete('/invites', ensureLoggedIn(), roomExistMiddleware, userIsRoomMemberMiddleware, userIsRoomOwnerMiddleware, removeInvite)

module.exports = router