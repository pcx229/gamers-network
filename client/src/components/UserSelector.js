
import {Avatar, CircularProgress, Grid, TextField, Typography} from '@material-ui/core'
import {Autocomplete} from '@material-ui/lab'
import React, {useEffect, useState} from 'react'
import {autoCompleteUser} from '../services/profileAPI'
import UserAnimalAvatar from './UserAnimalAvatar'

function UserSelector({value, setValue, textFieldInputProps, autoCompleteInputProps}) {

	const [input, setInput] = useState('')
	const [user, setUser] = useState(null)
	const [options, setOptions] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if(value && input !== value) {
			if(!user || user.email !== value) {
				setInput(value)
				const obj = {email: value}
				setUser(obj)
				setOptions([obj])
			}
		}
	}, [value, input, user])
	
	useEffect(() => {
		let active = true
	
		if (input === '') {
			setOptions([])
			return
		}

		setLoading(true)
		autoCompleteUser(input)
			.then(results => {
				if (active) {
					let newOptions = []

					if (user) {
						newOptions = [user]
					}
			
					if (results) {
						newOptions = [...newOptions, ...results.data]
					}

					setOptions(newOptions)
					setLoading(false)
				}
			})
			.catch(err => console.error(err))
	
		return () => {
			active = false
		}
	}, [user, input])
	
	return (
		<Autocomplete
			{...autoCompleteInputProps}
			getOptionSelected={(option, value) => option.email === value.email}
			filterOptions={(x) => x}
			loading={loading}
			getOptionLabel={(option) => (typeof option === 'string' ? option : option.email)}
			options={options}
			autoComplete
			includeInputInList
			filterSelectedOptions
			value={user}
			onChange={(event, newValue) => {
				setOptions(newValue ? [newValue, ...options] : options)
				setUser(newValue)
				setValue(newValue ? newValue.email : undefined)
			}}
			onInputChange={(event, newInputValue) => {
				setInput(newInputValue)
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					{...textFieldInputProps}
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<React.Fragment>
								{loading ? <CircularProgress color="inherit" size={20} /> : null}
								{params.InputProps.endAdornment}
							</React.Fragment>
						),
					}}
				/>
			)}
			renderOption={(option) => (
				<Grid container alignItems="center">
					<Grid item>
						{
							(option.image || option.name) ?
								<UserAnimalAvatar size="35px" alt="profile image" src={option.image} username={option.name} />
								:
								<Avatar sizes="35px" variant="circle">
									?
								</Avatar>
						}
					</Grid>
					<Grid item xs>
						{
							option.name ?
								<Typography variant="body2">
									&nbsp; {option.name}
								</Typography>
								: undefined
						}
						<Typography variant="body2" color="textSecondary">
							&nbsp; {option.email}
						</Typography>
					</Grid>
				</Grid>
			)}
		/>
	)
}

export default UserSelector