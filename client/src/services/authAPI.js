
import axios from './axios.config'
import sha256 from 'crypto-js/sha256'

export function login(email, password, rememberMe) {
	return axios.post('/auth/login', {email, password: sha256(password).toString(), rememberMe})
}

export function logout() {
	return axios.get('/auth/logout')
}

export function signup(name, email, password) {
	return axios.post('/auth/signup', {name, email, password: sha256(password).toString()})
}

export function profile() {
	return axios.get('/auth/profile')
}

export function forgotPassword(email) {
	return axios.get('/auth/request_password_reset', {params: {email}})
}

export function resetPassword(code, password) {
	if (password) {
		return axios.post('/auth/reset_password', {password: sha256(password).toString()}, {params: {code}})
	} else {
		return axios.post('/auth/reset_password', {}, {params: {code}})
	}
}
