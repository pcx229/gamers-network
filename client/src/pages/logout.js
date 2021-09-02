
import {logout} from '../services/authAPI'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {removeUser} from '../state/userSlice'
import {Box, CircularProgress, Typography} from '@material-ui/core'
import React, {useEffect} from 'react'

export default function Logout() {

	const history = useHistory()
	const dispatch = useDispatch()

	useEffect(() => {
		logout()
			.then(() => {
				dispatch(removeUser())
			})
			.finally(() => history.push('/'))
	}, [history, dispatch])

	return (
		<Box display="flex" flexDirection="column" alignItems="center" margin="20px">
			<Typography color="textPrimary">Logging out...</Typography>
			<Box height="20px" />
			<CircularProgress />
		</Box>
	)
}