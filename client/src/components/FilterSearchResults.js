import React, {useEffect, useState, useImperativeHandle, forwardRef} from 'react'
import { Box, FormControlLabel, FormGroup, Icon, makeStyles, Typography, TextField, Radio, FormControl, RadioGroup, FormLabel, Grid, ButtonGroup, Button} from '@material-ui/core'
import GameSelector from '../components/GameSelector'
import CountrySelector from './CountrySelector'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
	filters: {
		width: 'initial',
		backgroundColor: theme.palette.background.paper,
		borderRadius: '12px',
		margin: '20px',
		padding: '10px',
		color: theme.palette.text.primary
	},
	filtersToggle: {
		'& p': {
			display: 'flex',
			alignItems: 'center',
			cursor: 'pointer',
			userSelect: 'none'
		}
	}
}))

function FilterSearchResults({init}, ref) { // init should be a state so it won't changed in repeated calls 
	const classes = useStyles()

	const [showFilters, setShowFilters] = useState(true)
	const [type, setType] = useState('rooms')

	// rooms
	const [roomsParticipates, setRoomsParticipates] = useState({min: undefined, max: undefined})
	const [roomsGame, setRoomsGame] = useState(undefined)
	const [roomsPlatform, setRoomsPlatform] = useState('Any')

	// peoples
	const [peoplesCountry, setPeoplesCountry] = useState(undefined)
	const [peoplesGame, setPeoplesGame] = useState(undefined)
	const [peoplesPlatform, setPeoplesPlatform] = useState('Any')

	useEffect(() => {
		if(init) {
			if(init.type !== undefined) {
				setType(init.type)

				if(init.type === 'rooms') {
					const res = { min: undefined, max: undefined }
					if(init.min_participates !== undefined && !isNaN(init.min_participates)) {
						res['min'] = parseInt(init.min_participates)
					}
					if(init.max_participates !== undefined && !isNaN(init.max_participates)) {
						res['max'] = parseInt(init.max_participates)
					}
					setRoomsParticipates(res)

					if(init.game !== undefined) {
						setRoomsGame(init.game)
					}
					if(init.platform !== undefined) {
						setRoomsPlatform(init.platform)
					}
				} 
				
				if(init.type === 'peoples') {
					if(init.country !== undefined) {
						setPeoplesCountry(init.country)
					}
					if(init.game !== undefined) {
						setPeoplesGame(init.game)
					}
					if(init.platform !== undefined) {
						setRoomsPlatform(init.platform)
					}
				}
			}
		}
	}, [init])

	useImperativeHandle(ref, () => ({
		data: () => {
			if(type === 'rooms') {
				return {
					type,
					min_participates: (!isNaN(roomsParticipates['min']) ? roomsParticipates['min'] : undefined),
					max_participates: (!isNaN(roomsParticipates['max']) ? roomsParticipates['max'] : undefined),
					game: roomsGame,
					platform: roomsPlatform !== 'Any' ? roomsPlatform : undefined
				}
			}
			if(type === 'peoples') {
				return {
					type,
					country: peoplesCountry,
					game: peoplesGame,
					platform: peoplesPlatform !== 'Any' ? peoplesPlatform : undefined
				}
			}
		}
	}))

	return (
		<Box className={classes.filters}>
			<div className={classes.filtersToggle} onClick={() => setShowFilters(!showFilters)}>
				{
					showFilters ? 
						<Typography color="textPrimary">
							<Icon>remove_circle_outline</Icon> &nbsp; Filter results
						</Typography>
						:
						<Typography color="textPrimary">
							<Icon>add_circle_outline</Icon> &nbsp; Filter results
						</Typography>
				}
			</div>
			<div style={{display: showFilters ? 'block' : 'none'}}>
				<hr />
				<br />
				<Grid container spacing={3}>
					<Grid item>
						<FormControl component="fieldset">
							<FormLabel color="secondary" component="legend">Type</FormLabel>
							<Box height="10px" />
							<RadioGroup aria-label="type" name="type" value={type} onChange={(event) => setType(event.target.value)} >
								<FormControlLabel value="rooms" control={<Radio color="secondary" />} label="Rooms" />
								<FormControlLabel value="peoples" control={<Radio color="secondary" />} label="Peoples" />
							</RadioGroup>
						</FormControl>
					</Grid>
					<Grid item>
						<FormControl component="fieldset">
							<FormLabel color="secondary" component="legend">Options</FormLabel>
							<Box height="20px" />
							{
								type === 'rooms' ?
									<>
										<FormGroup row>
											<Typography color="textPrimary">participants</Typography>
											&nbsp; &nbsp;
											<TextField
												type="number"
												placeholder="min"
												color='secondary'
												value={String(roomsParticipates['min'])}
												onChange={(event) => setRoomsParticipates({...roomsParticipates, min: event.target.value})}
											/>
											&nbsp; &nbsp;
											<TextField
												type="number"
												placeholder="max"
												color='secondary'
												value={String(roomsParticipates['max'])}
												onChange={(event) => setRoomsParticipates({...roomsParticipates, max: event.target.value})}
											/>
										</FormGroup>
										<Box height="20px" />
										<FormGroup row>
											<Typography color="textPrimary">game</Typography>
											&nbsp; &nbsp;
											<GameSelector 
												value={roomsGame}
												setValue={setRoomsGame} 
												textFieldInputProps={{
													style: {width: '300px'},
													color: 'secondary'
												}
												} />
										</FormGroup>
										<Box height="20px" />
										<FormGroup row>
											<Typography color="textPrimary">platform</Typography>
											&nbsp; &nbsp;
											<ButtonGroup aria-label="outlined primary button group">
												{
													['Any', 'Pc', 'Xbox', 'Playstation', 'Android', 'Psp', 'Apple'].map(p => {
														return (
															<Button key={p} variant={clsx({'contained':(roomsPlatform === p)})} onClick={() => setRoomsPlatform(p)}>{p}</Button>
														)
													})
												}
											</ButtonGroup>
										</FormGroup>
									</>
									:
									<>
										<FormGroup row>
											<Typography color="textPrimary">from country</Typography>
											&nbsp; &nbsp;
											<CountrySelector 
												value={peoplesCountry} 
												setValue={setPeoplesCountry}
												textFieldInputProps={{
													style: {width: '300px'},
													color: 'secondary'
												}
												} />
										</FormGroup>
										<Box height="20px" />
										<FormGroup row>
											<Typography color="textPrimary">that plays this game</Typography>
											&nbsp; &nbsp;
											<GameSelector 
												value={peoplesGame}
												setValue={setPeoplesGame} 
												textFieldInputProps={{
													style: {width: '300px'},
													color: 'secondary'
												}
												} />
										</FormGroup>
										<Box height="20px" />
										<FormGroup row>
											<Typography color="textPrimary">on platform</Typography>
											&nbsp; &nbsp;
											<ButtonGroup aria-label="outlined primary button group">
												{
													['Any', 'Pc', 'Xbox', 'Playstation', 'Android', 'Psp', 'Apple'].map(p => {
														return (
															<Button key={p} variant={clsx({'contained':(peoplesPlatform === p)})} onClick={() => setPeoplesPlatform(p)}>{p}</Button>
														)
													})
												}
											</ButtonGroup>
										</FormGroup>
									</>
							}
						</FormControl>
					</Grid>
				</Grid>
			</div>
		</Box>
	)
}

export default forwardRef(FilterSearchResults)