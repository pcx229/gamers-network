
import axios from './axios.config'

export function list(userId) {
	return axios.get('/room/list', {params: {userId}})
}

export function deleteRoom(roomId) {
	return axios.delete('/room/', {params: {roomId}})
}

export function leave(roomId) {
	return axios.delete('/room/members', {params: {roomId}})
}

export function join(roomId) {
	return axios.post('/room/members', {}, {params: {roomId}})
}

export function kickUser(roomId, userId) {
	return axios.delete('/room/members/kick', {params: {roomId}, data: {userId}})
}

export function inviteExist(roomId, code) {
	return axios.get('/room/invites', {params: {roomId, code}})
}

export function inviteStatus(roomId, code, accepted) {
	return axios.put('/room/invites', {accepted}, {params: {roomId, code}})
}

export function edit(roomId, name, game, platform, description, isPrivate) {
	return axios.put('/room', {name, game, platform, description, private: isPrivate}, {params: {roomId}})
}

export function create(name, game, platform, description, isPrivate) {
	return axios.post('/room', {name, game, platform, description, private: isPrivate})
}

export function info(roomId) {
	return axios.get('/room', {params: {roomId}})
}

export function members(roomId) {
	return axios.get('/room/members', {params: {roomId}})
}

export function isMember(roomId) {
	return axios.get('/room/is-member', {params: {roomId}})
}

export function announcements(roomId) {
	return axios.get('/room/announcements', {params: {roomId}})
}

export function announce(roomId, message) {
	return axios.post('/room/announcements', {message}, {params: {roomId}})
}

export function deleteAnnouncement(roomId, announcementId) {
	return axios.delete('/room/announcements', {params: {roomId}, data: {announcementId}})
}

export function schedules(roomId) {
	return axios.get('/room/schedule', {params: {roomId}})
}

export function schedule(roomId, fromDate, toDate) {
	return axios.post('/room/schedule', {fromDate, toDate}, {params: {roomId}})
}

export function deleteSchedule(roomId, scheduleId) {
	return axios.delete('/room/schedule', {params: {roomId}, data: {scheduleId}})
}

export function autoCompleteGame(name) {
	return axios.get('/games/autoComplete', {params: {name}})
}

export function invites(roomId) {
	return axios.get('/room/invites/list', {params: {roomId}})
}

export function invite(roomId, userEmail) {
	return axios.post('/room/invites', {userEmail}, {params: {roomId}})
}

export function deleteInvite(roomId, inviteId) {
	return axios.delete('/room/invites', {params: {roomId}, data: {inviteId}})
}