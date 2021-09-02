
import React from 'react'
import {resetPassword} from '../services/authAPI'
import {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {Box, Button, CircularProgress, FormControl, FormHelperText, Grid, TextField, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import {makeStyles} from '@material-ui/core/styles'
import SideViewFormLayout from '../components/SideViewFormLayout'
import Joi from 'joi'
import passwordStrength from '../util/passwordStrength'

const useStyles = makeStyles((theme) => ({
	link: {
		margin: theme.spacing(1),
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
}))

export default function ResetPassword() {
	const classes = useStyles()

	const [password, setPassword] = useState('')
	const [passwordValidation, setPasswordValidation] = useState(undefined)
	const [repassword, setRePassword] = useState('')
	const [repasswordValidation, setRePasswordValidation] = useState(undefined)

	const {code} = useParams()

	const [linkIsValid, setLinkIsValid] = useState(undefined)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState()
	const [success, setSuccess] = useState(false)

	useEffect(() => {
		setLinkIsValid(undefined)
		resetPassword(code, undefined)
			.catch((err) => {
				if (err.response && err.response.data === 'password is required') {
					setLinkIsValid(true)
				} else {
					setLinkIsValid(false)
				}
			})
	}, [code])

	function onPasswordChange(event) {
		setPassword(event.target.value)
		setPasswordValidation(undefined)
	}

	function onRePasswordChange(event) {
		setRePassword(event.target.value)
		setRePasswordValidation(undefined)
	}

	function onSubmit(event) {
		event.preventDefault()
		// reest
		setError(undefined)
		setLoading(true)
		setPasswordValidation(undefined)
		setRePasswordValidation(undefined)
		// validate input
		let valid = true
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
		if (!valid) {
			setLoading(false)
			return
		}
		// send request
		resetPassword(code, password)
			.then(() => {
				setSuccess(true)
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

	if (linkIsValid === undefined) {
		return (
			<Box textAlign='center' m={5}>
				<CircularProgress />
			</Box>
		)
	}

	if (linkIsValid === false) {
		return (
			<SideViewFormLayout image={process.env.PUBLIC_URL + '/images/photo-1521725168367-2f46504f075e.webp'}>
				<Typography component='h1' variant='h5' className={classes.title}>
					Reset Your Password
				</Typography>

				<Alert severity='error'>
					Link is invalid or has been expired!
					<br />
					it can no longer reset any account password
				</Alert>

				<Grid container direction='column' justify='center' alignItems='center'>
					<Grid item xs={12}>
						<Link to='/forgot-password' className={classes.link}>
							<Typography> Resend a new link? </Typography>
						</Link>
					</Grid>
				</Grid>
			</SideViewFormLayout>
		)
	}

	if (success) {
		return (
			<SideViewFormLayout image={process.env.PUBLIC_URL + '/images/photo-1521725168367-2f46504f075e.webp'}>
				<Typography component='h1' variant='h5' className={classes.title}>
					Change Has Been Saved
				</Typography>

				<Alert severity='success'>
					Your password has been changed
					<br />
					now you can log in with the new password
				</Alert>

				<Grid container direction='column' justify='center' alignItems='center'>
					<Grid item xs={12}>
						<Link to='/login' className={classes.link}>
							<Typography> Go to log in </Typography>
						</Link>
					</Grid>
				</Grid>
			</SideViewFormLayout>
		)
	}

	return (
		<SideViewFormLayout image={process.env.PUBLIC_URL + '/images/photo-1521725168367-2f46504f075e.webp'}>
			<Typography component='h1' variant='h5' className={classes.title}>
				Reset Your Password
			</Typography>

			<form noValidate>

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

				<Button
					type='submit'
					fullWidth
					variant='contained'
					color='primary'
					className={classes.submit}
					onClick={onSubmit}
					disabled={loading} >
					{loading ?
						<CircularProgress color='inherit' size={20} className={classes.progress} /> : undefined}
					Submit
				</Button>
				<Box display={clsx({'none': error === undefined})}>
					<Alert severity='error'>
						{error}
					</Alert>
				</Box>
			</form>
		</SideViewFormLayout>
	)
}
