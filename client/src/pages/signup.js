
import React from 'react'
import {signup} from '../services/authAPI'
import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {Box, Button, Checkbox, CircularProgress, FormControl, FormControlLabel, FormHelperText, Grid, TextField, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import {makeStyles} from '@material-ui/core/styles'
import SideViewFormLayout from '../components/SideViewFormLayout'
import Joi from 'joi'
import passwordStrength from '../util/passwordStrength'

const useStyles = makeStyles((theme) => ({
	link: {
		margin: theme.spacing(1),
		color: theme.palette.text.primary
	},
	submit: {
		margin: '2rem auto',
		borderRadius: '30px',
		padding: '0.5rem 0',
	},
	progress: {
		marginRight: '2rem',
	},
	title: {
		margin: theme.spacing(2),
	},
	password_strength: {
		color: 'gray',
		margin: '0 .5rem',
	},
}))

export default function Signup() {
	const classes = useStyles()

	const [name, setName] = useState('')
	const [nameValidation, setNameValidation] = useState(undefined)
	const [email, setEmail] = useState('')
	const [emailValidation, setEmailValidation] = useState(undefined)
	const [password, setPassword] = useState('')
	const [passwordValidation, setPasswordValidation] = useState(undefined)
	const [repassword, setRePassword] = useState('')
	const [repasswordValidation, setRePasswordValidation] = useState(undefined)
	const [agreeToTermsAndConditions, setAgreeToTermsAndConditions] = useState(false)
	const [agreeToTermsAndConditionsValidation, setAgreeToTermsAndConditionsValidation] = useState(undefined)

	const history = useHistory()

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState()

	function onNameChange(event) {
		setName(event.target.value)
		setNameValidation(undefined)
	}

	function onEmailChange(event) {
		setEmail(event.target.value)
		setEmailValidation(undefined)
	}

	function onPasswordChange(event) {
		setPassword(event.target.value)
		setPasswordValidation(undefined)
	}

	function onRePasswordChange(event) {
		setRePassword(event.target.value)
		setRePasswordValidation(undefined)
	}

	function onAgreeToTermsAndConditionsChange(event) {
		setAgreeToTermsAndConditions(event.target.checked)
		setAgreeToTermsAndConditionsValidation(undefined)
	}

	function onSignup(event) {
		event.preventDefault()
		// reest
		setError(undefined)
		setLoading(true)
		setNameValidation(undefined)
		setEmailValidation(undefined)
		setPasswordValidation(undefined)
		setRePasswordValidation(undefined)
		setAgreeToTermsAndConditionsValidation(undefined)
		// validate input
		let valid = true
		if (name === '') {
			setNameValidation('this field is reqired')
			valid = false
		} else if (Joi.string().min(3).max(64).pattern(/^[a-zA-Z0-9][a-zA-Z0-9 -_'+]+[a-zA-Z0-9]$/).validate(name).error) {
			// eslint-disable-next-line
			setNameValidation("name must start and end with an alphanumerical letter, in the middle one or more alphanumerical letters or symbols [space]-_'+")
			valid = false
		}
		if (email === '') {
			setEmailValidation('this field is reqired')
			valid = false
		} else if (Joi.string().email({tlds: {allow: false}}).validate(email).error) {
			setEmailValidation('this is not a valid email address')
			valid = false
		}
		if (password === '') {
			setPasswordValidation('this field is reqired')
			valid = false
		} else if (Joi.string().min(6).max(64).validate(password).error) {
			setPasswordValidation('password need to be between 6 to 64 characters long')
			valid = false
		}
		if (repassword === '') {
			setRePasswordValidation('this field is reqired')
			valid = false
		} else if (repassword !== password) {
			setRePasswordValidation('passwords dose not match')
			valid = false
		}
		if (!agreeToTermsAndConditions) {
			setAgreeToTermsAndConditionsValidation('you must agree to terms and conditions')
			valid = false
		}
		if (!valid) {
			setLoading(false)
			return
		}
		// attempt signup
		signup(name, email, password)
			.then(() => {
				history.replace({
					pathname: '/login',
					state: {
						signup: 1,
					},
				})
			})
			.catch((err) => {
				if (err.response) {
					setError(err.response.data)
				} else {
					setError(err.message)
				}
				setLoading(false)
			})
	}


	return (
		<SideViewFormLayout image={process.env.PUBLIC_URL + './images/photo-1513701589220-af816329378c.webp'}>
			<Typography component='h1' variant='h5' className={classes.title}>
				Join us
			</Typography>
			<form noValidate>
				<TextField
					name='name'
					label='Name'
					type='text'
					variant='outlined'
					onChange={onNameChange}
					value={name}
					disabled={loading}
					error={nameValidation !== undefined}
					helperText={nameValidation}
					required
					fullWidth
					autoFocus
					margin='normal'
				/>

				<TextField
					name='email'
					label='Email Address'
					type='text'
					variant='outlined'
					onChange={onEmailChange}
					value={email}
					disabled={loading}
					error={emailValidation !== undefined}
					helperText={emailValidation}
					required
					fullWidth
					margin='normal'
				/>


				<FormControl component='fieldset' fullWidth>
					<TextField
						name='password'
						label='Password'
						type='password'
						variant='outlined'
						onChange={onPasswordChange}
						value={password}
						disabled={loading}
						error={passwordValidation !== undefined}
						helperText={passwordValidation}
						required
						fullWidth
						margin='normal'
					/>
					<FormHelperText className={classes.password_strength}>
						{(password && password !== '') ? `strength: ${passwordStrength(password)}` : undefined}
					</FormHelperText>
				</FormControl>

				<TextField
					name='repassword'
					label='Re Enter Password'
					type='password'
					variant='outlined'
					onChange={onRePasswordChange}
					value={repassword}
					disabled={loading}
					error={repasswordValidation !== undefined}
					helperText={repasswordValidation}
					required
					fullWidth
					margin='normal'
				/>

				<FormControl required error={agreeToTermsAndConditionsValidation !== undefined} component='fieldset' fullWidth>
					<FormControlLabel
						control={<Checkbox
							value='remember'
							color='primary'
							onChange={onAgreeToTermsAndConditionsChange}
							checked={agreeToTermsAndConditions}
							disabled={loading}
							required />}
						label='Agree to terms and conditions'
						margin='normal'
					/>
					<FormHelperText>{agreeToTermsAndConditionsValidation}</FormHelperText>
				</FormControl>

				<Button
					type='submit'
					fullWidth
					variant='contained'
					color='primary'
					className={classes.submit}
					onClick={onSignup}
					disabled={loading} >
					{loading ?
						<CircularProgress color='inherit' size={20} className={classes.progress} /> : undefined}
					Sign up
				</Button>
				<Box display={clsx({'none': error === undefined})}>
					<Alert severity='error'>
						{error}
					</Alert>
				</Box>
				<Grid container direction='column' justify='center' alignItems='center'>
					<Grid item xs={12}>
						<Link to='/login' className={classes.link}>
							<Typography> Already have an account? log in now </Typography>
						</Link>
					</Grid>
				</Grid>
			</form>
		</SideViewFormLayout>
	)
}
