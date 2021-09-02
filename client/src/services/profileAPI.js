
import axios from './axios.config'

export function info(userId) {
	return axios.get('/profile', {params: {userId}})
}

export function edit(image, name, birthday, country, status) {
	return axios.put('/profile', {image, name, birthday, country, status})
}

export function friendsList(userId) {
	return axios.get('/profile/friends', {params: {userId}})
}

export function addFriend(friendUserEmail) {
	return axios.post('/profile/friends', {friendUserEmail})
}

export function deleteFriend(friendId) {
	return axios.delete('/profile/friends', {data: {friendId}})
}

export function gamesList(userId) {
	return axios.get('/profile/games', {params: {userId}})
}

export function addGame(name, platform) {
	return axios.post('/profile/games', {name, platform})
}

export function deleteGame(gameId) {
	return axios.delete('/profile/games', {data: {gameId}})
}

export function autoCompleteUser(email) {
	return axios.get('/profile/autoComplete', {params: {email}})
}