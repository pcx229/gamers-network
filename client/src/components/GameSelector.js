
import {Avatar, CircularProgress, Grid, TextField, Typography} from '@material-ui/core'
import {Autocomplete} from '@material-ui/lab'
import React, {useEffect, useState} from 'react'
import {autoCompleteGame} from '../services/roomAPI'

function GameSelector({value, setValue, textFieldInputProps, autoCompleteInputProps}) {

	const [input, setInput] = useState('')
	const [game, setGame] = useState(null)
	const [options, setOptions] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if(value && input !== value) {
			if(!game || game.name !== value) {
				setInput(value)
				const obj = {name: value}
				setGame(obj)
				setOptions([obj])
			}
		}
	}, [value, input, game])
	
	useEffect(() => {
		let active = true
	
		if (input === '') {
			setOptions([])
			return
		}

		setLoading(true)
		autoCompleteGame(input)
			.then(results => {
				if (active) {
					let newOptions = []

					if (game) {
						newOptions = [game]
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
	}, [game, input])
	
	return (
		<Autocomplete
			{...autoCompleteInputProps}
			getOptionSelected={(option, value) => option.name === value.name}
			filterOptions={(x) => x}
			loading={loading}
			getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
			options={options}
			autoComplete
			includeInputInList
			filterSelectedOptions
			value={game}
			onChange={(event, newValue) => {
				setOptions(newValue ? [newValue, ...options] : options)
				setGame(newValue)
				setValue(newValue ? newValue.name : undefined)
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
	)
}

export default GameSelector