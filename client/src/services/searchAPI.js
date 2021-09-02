
import axios from './axios.config'

export function rooms(name, game, platform, min_participates, max_participates, limit, skip) {
	return axios.get('/search/rooms', {params: {name, game, platform, min_participates, max_participates, limit, skip}})
}

export function peoples(name, game, platform, country, limit, skip) {
	return axios.get('/search/peoples', {params: {name, game, platform, country, limit, skip}})
}
