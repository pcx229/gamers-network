import {Box, Button, ButtonGroup, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormGroup, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import clsx from 'clsx'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {addGame} from '../state/profileSlice'
import GameSelector from './GameSelector'

export default function DialogAddGameToProfile({open, setOpen}) {

	const dispatch = useDispatch()

	const [game, setGame] = useState(undefined)
	const [platform, setPlatform] = useState('Pc')
	const [inputInvalid, setInputInvalid] = useState(false)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	function save() {
		if(game && platform) {
			setLoading(true)
			setError(undefined)
			dispatch(addGame({name: game, platform}))
				.then(() => {
					setOpen(false)
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

	function resetInput() {
		setGame(undefined)
		setPlatform('Pc')
	}

	return (
		<Dialog
			open={open}
			onClose={() => {
				setOpen(false)
				resetInput()
			}}
			aria-labelledby="responsive-dialog-title" >
			<DialogTitle id="responsive-dialog-title">Add Game</DialogTitle>
			<DialogContent>
				<FormControl component="fieldset">
					<FormGroup>
						<Typography color="textPrimary">Game</Typography>
						<Box height="10px" />
						<GameSelector 
							value={game} 
							setValue={setGame}
							autoCompleteInputProps={{
								disabled: loading
							}} />
					</FormGroup>
					<Box height="20px" />
					<FormGroup>
						<Typography color="textPrimary">Platform</Typography>
						<Box height="10px" />
						<ButtonGroup aria-label="outlined primary button group" disabled={loading}>
							{
								['Pc', 'Xbox', 'Playstation', 'Android', 'Psp', 'Apple'].map(p => {
									return (
										<Button key={p} variant={clsx({'contained':(platform === p)})} onClick={() => setPlatform(p)}>{p}</Button>
									)
								})
							}
						</ButtonGroup>
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
					Add
				</Button>
			</DialogActions>
		</Dialog>
	)
}