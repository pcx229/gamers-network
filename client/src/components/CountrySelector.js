import React, {useEffect, useState} from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'
import ReactCountryFlag from 'react-country-flag'
import countries, {getCountryByLabel} from '../util/countries'

const useStyles = makeStyles({
	option: {
		fontSize: 15,
		'& > span': {
			marginRight: 10,
			fontSize: 18,
		},
	}
})

export default function CountrySelector({value, setValue, textFieldInputProps}) {
	const classes = useStyles()

	const [country, setCountry] = useState(null)

	useEffect(() => {
		if(country === null && value !== undefined && value !== '') {
			const found = getCountryByLabel(value)
			if(found) {
				setCountry(found)
			} else {
				console.error(`country "${value}" is not in the available countries list`)
			}
		}
	}, [value, country])

	function onChangeCountry(event, country) {
		if(country !== null) {
			setValue(country.label)
		} else {
			setValue(undefined)
		}
		setCountry(country) 
	}

	return (
		<Autocomplete
			value={country}
			options={countries}
			classes={{
				option: classes.option,
			}}
			autoHighlight
			getOptionLabel={(option) => option.label}
			renderOption={(option) => (
				<>
					<span><ReactCountryFlag svg countryCode={option.code} /></span>
					{option.label} ({option.code}) +{option.phone}
				</>
			)}
			onChange={onChangeCountry}
			renderInput={(params) => (
				<TextField
					{...params}
					{...textFieldInputProps}
					inputProps={{
						...params.inputProps,
						autoComplete: 'new-password', // disable autocomplete and autofill
					}}
				/>
			)}
		/>
	)
}