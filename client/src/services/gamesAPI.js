
import axios from './axios.config'

export function getRandomGames() {
	return axios.get('/games/random')
}

export function getGameInfo(name) {
	return axios.get('/games/info', { params: { name }})
}

export function getGameCoverUrl(name) {
	return process.env.REACT_APP_SERVER_URL + '/api/games/cover/' + name
}