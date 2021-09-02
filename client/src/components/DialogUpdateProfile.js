import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormGroup, Icon, IconButton, InputAdornment, TextField} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import Joi from 'joi'
import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {selectProfile, actionAfterEditProfile, updateFriends} from '../state/profileSlice'
import {edit as profileEdit} from '../services/profileAPI'
import CountrySelector from '../components/CountrySelector'
import {KeyboardDatePicker} from '@material-ui/pickers'

export default function DialogUpdateProfile({open, setOpen}) {

	const {name, country, birthday, image, status} = useSelector(selectProfile)
	const dispatch = useDispatch()

	const [inputName, setInputName] = useState('')
	const [inputNameValidation, setInputNameValidation] = useState(undefined)
	const [inputCountry, setInputCountry] = useState(undefined)
	const [inputBirthday, setInputBirthday] = useState(null)
	const [inputImage, setInputImage] = useState('')
	const [inputImageValidation, setInputImageValidation] = useState(undefined)
	const [inputStatus, setInputStatus] = useState('')
	const [inputStatusValidation, setInputStatusValidation] = useState(undefined)

	const [inputInvalid, setInputInvalid] = useState(false)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	useEffect(() => {
		setInputName(name)
		setInputCountry(country)
		setInputBirthday(birthday || null)
		setInputImage(image || '')
		setInputStatus(status || '')
	}, [name, country, birthday, image, status])

	function save() {
		// validate
		let valid = true
		if (Joi.string().min(3).max(64).pattern(/^[a-zA-Z0-9][a-zA-Z0-9 -_'+]+[a-zA-Z0-9]$/).validate(inputName).error) {
			// eslint-disable-next-line
			setInputNameValidation("name must start and end with an alphanumerical letter, in the middle one or more alphanumerical letters or symbols [space]-_'+")
			valid = false
		}
		if (inputStatus !== '' && Joi.string().max(256).validate(inputStatus).error) {
			// eslint-disable-next-line
			setInputStatusValidation("status length should be at maximum 256 characters")
			valid = false
		}
		if (inputImage !== '' && Joi.string().uri().validate(inputImage).error) {
			// eslint-disable-next-line
			setInputImageValidation("image must be a valid URL")
			valid = false
		}
		if(!valid) {
			setInputInvalid(true)
			return
		}
		// update
		setLoading(true)
		setError(undefined)
		profileEdit(inputImage.trim() === '' ? undefined : inputImage, 
			inputName, 
			inputBirthday || undefined, 
			inputCountry || undefined, 
			(inputStatus || '').trim() === '' ? undefined : inputStatus)
			.then(() => {
				let birthday
				if(inputBirthday) {
					if(typeof inputBirthday === 'object') {
						birthday = inputBirthday.toISOString()
					} else if(typeof inputBirthday === 'string') {
						birthday = inputBirthday
					} else {
						birthday = undefined
					}
				} else {
					birthday = undefined
				}
				dispatch(actionAfterEditProfile({name: inputName, country: inputCountry || undefined, birthday: birthday, image: inputImage || undefined, status: ((inputStatus || '').trim() === '' ? undefined : inputStatus)}))
				dispatch(updateFriends())
				setOpen(false)
			})
			.catch(err => {
				setError(err.message)
				console.error(err)
			})
			.finally(() => {
				setLoading(false)
			})
	}

	function reset() {
		setInputName(name)
		setInputCountry(country)
		setInputBirthday(birthday)
		setInputImage(image)
		setInputStatus(status)
	}

	function close() {
		reset()
		setOpen(false)
	}

	function onNameChange(event) {
		setInputName(event.target.value)
		setInputNameValidation(undefined)
	}

	function onStatusChange(event) {
		setInputStatus(event.target.value)
		setInputStatusValidation(undefined)
	}

	function onImageChange(event) {
		setInputImage(event.target.value)
		setInputImageValidation(undefined)
	}

	function onBirthdayChange(value) {
		setInputBirthday(value)
	}

	function onBirthdayRemove(event) {
		event.preventDefault()
		event.stopPropagation()
		setInputBirthday(null)
	}

	return (
		<Dialog
			open={open}
			onClose={close}
			aria-labelledby="responsive-dialog-title" >
			<DialogTitle id="responsive-dialog-title">Edit</DialogTitle>
			<DialogContent>
				<FormControl component="fieldset">
					<FormGroup>
						<TextField
							name="name"
							label="Name"
							type="text"
							variant="outlined"
							onChange={onNameChange}
							value={inputName}
							disabled={loading}
							error={inputNameValidation !== undefined}
							helperText={inputNameValidation}
							required
							fullWidth
							autoFocus
							margin="normal"
						/>
					</FormGroup>
					<Box height="20px" />
					<FormGroup>
						<CountrySelector 
							value={inputCountry} 
							setValue={setInputCountry} 
							textFieldInputProps={{
								name: 'country',
								label: 'Country',
								variant: 'outlined'
							}} />
					</FormGroup>
					<Box height="25px" />
					<FormGroup>
						<KeyboardDatePicker
							fullWidth
							disableFuture
							variant="inline"
							inputVariant="outlined"
							disabled={loading}
							label={inputBirthday && 'Birthday'}
							placeholder="Birthday"
							format="DD/MM/YYYY"
							value={inputBirthday}
							onChange={onBirthdayChange}
							InputAdornmentProps={{ position: 'start' }}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											disabled={loading}
											aria-label="event"
											onClick={onBirthdayRemove}>
											<Icon> close </Icon>
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</FormGroup>
					<Box height="10px" />
					<FormGroup>
						<TextField
							name='image'
							label='Image'
							type='text'
							variant='outlined'
							onChange={onImageChange}
							value={inputImage}
							disabled={loading}
							error={inputImageValidation !== undefined}
							helperText={inputImageValidation}
							fullWidth
							margin='normal'
						/>
					</FormGroup>
					<Box height="10px" />
					<FormGroup>
						<TextField
							name='status'
							label='status'
							type='text'
							rows={8}
							multiline
							variant='outlined'
							onChange={onStatusChange}
							value={inputStatus}
							disabled={loading}
							error={inputStatusValidation !== undefined}
							helperText={inputStatusValidation}
							fullWidth
							margin='normal'
						/>
					</FormGroup>
				</FormControl>
				{
					inputInvalid ?
						<Alert severity="error">Error: input invalid </Alert>
						: undefined
				}
			</DialogContent>
			{
				error ?
					<Alert severity="error">{error}</Alert>
					: undefined
			}
			<DialogActions>
				<Button
					disabled={loading} 
					autoFocus 
					onClick={close} 
					color="primary">
					Discard
				</Button>
				<Button 
					disabled={loading} 
					onClick={save} 
					color="primary" 
					autoFocus>
					{
						loading ?
							<>
								<CircularProgress size={15} color="inherit" />
								&nbsp;
								&nbsp;
							</>
							: undefined
					}
					Save
				</Button>
			</DialogActions>
		</Dialog>
	)
}