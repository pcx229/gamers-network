
import {Avatar, Button, ButtonGroup, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, Switch, TextField, Typography} from '@material-ui/core'
import {Alert, Autocomplete} from '@material-ui/lab'
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {actionAfterEditRoom, selectRoom} from '../state/roomSlice'
import {useDispatch, useSelector} from 'react-redux'
import clsx from 'clsx'
import Joi from 'joi'
import {autoCompleteGame, create as createRoom} from '../services/roomAPI'
import {
	edit as gameEditRoom
} from '../services/roomAPI'

function _InputRoom({init, disabled}, ref) { // init should be a state so it won't changed in repeated calls 

	const [name, setName] = useState('')
	const [nameValidation, setNameValidation] = useState(undefined)
	const [game, setGame] = useState(null)
	const [inputGame, setInputGame] = useState('')
	const [gameValidation, setGameValidation] = useState(undefined)
	const [platform, setPlatform] = useState('Pc')
	const [description, setDescription] = useState('')
	const [descriptionValidation, setDescriptionValidation] = useState(undefined)
	const [isPrivate, setIsPrivate] = useState(false)

	const [gameSelectOptions, setGameSelectOptions] = useState([])
	const [gameSelectLoading, setGameSelectLoading] = useState(false)

	useImperativeHandle(ref, () => ({
		validate: () => {
			setNameValidation(undefined)
			setGameValidation(undefined)
			setDescriptionValidation(undefined)
			let valid = true
			if (name === '') {
				setNameValidation('this field is required')
				valid = false
			} else if (Joi.string().min(3).max(64).pattern(/^[a-zA-Z0-9][a-zA-Z0-9 -_'+]+$/).validate(name).error) {
				// eslint-disable-next-line
				setNameValidation("name must start and end with an alphanumerical letter, then two or more alphanumerical letters or symbols [space]-_'+")
				valid = false
			}
			if (!game) {
				setGameValidation('this field is required')
				valid = false
			}
			if (description !== '' && Joi.string().max(256).validate(description).error) {
				setDescriptionValidation('maximum 256 characters allowed')
				valid = false
			}
			return valid
		},
		data: () => {
			return {
				name,
				game: game.name,
				platform,
				description,
				isPrivate
			}
		}
	}))

	useEffect(() => {
		if(init) {
			setName(init.name)
			setGame({name: init.game})
			setInputGame({name: init.game})
			setPlatform(init.platform)
			setDescription(init.description)
			setIsPrivate(init.isPrivate)
		}
	}, [init])

	function onNameChange(event) {
		setName(event.target.value)
		setNameValidation(undefined)
	}

	function onDescriptionChange(event) {
		setDescription(event.target.value)
		setDescriptionValidation(undefined)
	}

	function onPlatrormChange(platform) {
		setPlatform(platform)
	}
	
	useEffect(() => {
		let active = true

		setGameValidation(undefined)
	
		if (inputGame === '') {
			setGameSelectOptions(game ? [game] : [])
			return undefined
		}
	
		setGameSelectLoading(true)
		autoCompleteGame(inputGame)
			.then(results => {
				if (active) {
					let newOptions = []

					if (game) {
						newOptions = [game]
					}
			
					if (results) {
						newOptions = [...newOptions, ...results.data]
					}

					setGameSelectOptions(newOptions)
					setGameSelectLoading(false)
				}
			})
	
		return () => {
			active = false
		}
	}, [game, inputGame])
	
	return (
		<form noValidate>
			<TextField
				name='name'
				label='Name'
				type='text'
				variant='outlined'
				onChange={onNameChange}
				value={name}
				disabled={disabled}
				error={nameValidation !== undefined}
				helperText={nameValidation}
				required
				fullWidth
				autoFocus
				margin='normal'
				autoComplete='email'
			/>

			<br />

			<Autocomplete
				fullWidth
				defaultValue={init ? init.game : undefined}
				getOptionSelected={(option, value) => option.name === value.name}
				filterOptions={(x) => x}
				loading={gameSelectLoading}
				getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
				options={gameSelectOptions}
				autoComplete
				includeInputInList
				filterSelectedOptions
				value={game}
				onChange={(event, newValue) => {
					setGameSelectOptions(newValue ? [newValue, ...gameSelectOptions] : gameSelectOptions)
					setGame(newValue)
				}}
				onInputChange={(event, newInputValue) => {
					setInputGame(newInputValue)
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Game"
						fullWidth
						variant="outlined"
						disabled={disabled}
						error={gameValidation !== undefined}
						helperText={gameValidation}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<React.Fragment>
									{gameSelectLoading ? <CircularProgress color="inherit" size={20} /> : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
					/>
				)}
				renderOption={(option) => (
					<Grid container alignItems="center">
						<Grid item>
							<Avatar variant="rounded" alt="cover" src={option.image} />
						</Grid>
						<Grid item xs>
							<Typography variant="body2">
								&nbsp; {option.name}
							</Typography>
						</Grid>
					</Grid>
				)}
			/>

			<br />

			<ButtonGroup color="primary" aria-label="outlined primary button group" disabled={disabled}>
				{
					['Pc', 'Xbox', 'Playstation', 'Android', 'Psp', 'Apple'].map(p => {
						return (
							<Button key={p} variant={clsx({'contained':(platform === p)})} onClick={() => onPlatrormChange(p)}>{p}</Button>
						)
					})
				}
			</ButtonGroup>

			<br />
			
			<TextField
				name='description'
				label='description'
				type='text'
				rows={8}
				multiline
				variant='outlined'
				onChange={onDescriptionChange}
				value={description}
				disabled={disabled}
				error={descriptionValidation !== undefined}
				helperText={descriptionValidation}
				required
				fullWidth
				margin='normal'
			/>
			
			<br />
			
			<FormControlLabel
				value="end"
				control={<Switch color="primary" size="small" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />}
				label="Private"
				labelPlacement="end"
			/>
		</form>
	)
}

export const InputRoom = forwardRef(_InputRoom)

export function DialogEditRoom({open, close}) {

	const {roomId, name, game, platform, description, isPrivate} = useSelector(selectRoom)
	const dispatch = useDispatch()

	const [inputInvalid, setInputInvalid] = useState(false)

	const [initInput, setInitInput] = useState(undefined)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(undefined)

	const input = useRef()

	useEffect(() => {
		setInitInput({name, game, platform, description, isPrivate})
	}, [name, game, platform, description, isPrivate])

	function save() {
		if(input.current.validate()) {
			const {name, game, platform, description, isPrivate} = input.current.data()
			setLoading(true)
			setError(undefined)
			gameEditRoom(roomId, name, game, platform, description, isPrivate)
				.then(() => {
					dispatch(actionAfterEditRoom({name, game, platform, description, isPrivate}))
					close()
				})
				.catch(err => {
					setError(err.message)
					console.error(err)
				})
				.finally(() => {
					setLoading(false)
				})
		} else {
			setInputInvalid(true)
		}
	}

	return (
		<Dialog
			open={open}
			onClose={close} >
			<DialogTitle>Edit Room Properties</DialogTitle>
			<DialogContent>
				<InputRoom ref={input} init={initInput} disabled={loading} onClick={() => setInputInvalid(false)} />
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

export function DialogCreateRoom({open, close}) {

	const input = useRef()

	const [inputInvalid, setInputInvalid] = useState(false)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	function save() {
		if(input.current.validate()) {
			const {name, game, platform, description, isPrivate} =  input.current.data()
			setLoading(true)
			setError(undefined)
			createRoom(name, game, platform, description, isPrivate)
				.then(res => {
					close()
					const id = res.data
					window.open('/room/' + id)
				})
				.catch(err => {
					setError(err.message)
					console.error(err)
				})
				.finally(() => {
					setLoading(false)
				})
		} else {
			setInputInvalid(true)
		}
	}

	return (
		<Dialog
			open={open}
			onClose={close} >
			<DialogTitle>Create Room</DialogTitle>
			<DialogContent>
				<InputRoom ref={input} onClick={() => setInputInvalid(false)} />
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
					Create
				</Button>
			</DialogActions>
		</Dialog>
	)
}