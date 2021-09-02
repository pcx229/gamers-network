import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormGroup, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {addFriend} from '../state/profileSlice'
import UserSelector from './UserSelector'

export default function DialogAddFriendToProfile({open, setOpen}) {

	const dispatch = useDispatch()

	const [user, setUser] = useState(undefined)
	const [inputInvalid, setInputInvalid] = useState(false)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	function save() {
		if(user) {
			setLoading(true)
			setError(undefined)
			dispatch(addFriend(user))
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
		setUser(undefined)
	}

	return (
		<Dialog
			open={open}
			onClose={() => {
				setOpen(false)
				resetInput()
			}}
			aria-labelledby="responsive-dialog-title" >
			<DialogTitle id="responsive-dialog-title">Add Friend</DialogTitle>
			<DialogContent>
				<FormControl component="fieldset">
					<FormGroup>
						<Typography color="textPrimary">User Email</Typography>
						<Box height="10px" />
						<UserSelector 
							value={user} 
							setValue={setUser}
							autoCompleteInputProps={{
								disabled: loading,
								style:{
									width: '300px'
								}
							}} />
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