
function passwordStrength(password) {
	if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(password)) {
		return 'strong'
	}
	if (/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/.test(password)) {
		return 'medium'
	}
	return 'weak'
}

export default passwordStrength
