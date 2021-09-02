
import axios from './axios.config'

export function contact(name, email, message) {
	return axios.post('/contact', {name, email, message})
}
