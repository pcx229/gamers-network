
import React, {useState} from 'react'
import {Box, IconButton, InputAdornment, List, ListItem, ListItemText, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import {makeStyles} from '@material-ui/core/styles'
import Icon from '@material-ui/core/Icon'
import {DateTimePicker} from '@material-ui/pickers'
import moment from 'moment'
import {useDispatch, useSelector} from 'react-redux'
import {selectRoom, updateSchedule} from '../state/roomSlice'
import {
	schedule as gameMakeSchedule,
	deleteSchedule as gameDeleteSchedule
} from '../services/roomAPI'

const useStyles = makeStyles(() => ({
	container: {
		minWidth: '400px',
		height: '400px',
		display: 'flex',
		flexDirection: 'column'
	},
	list: {
		overflowY: 'auto',
		height: '100%'
	},
	error: {
		marginBottom: '0.5em'
	}
}))

function RoomSchedule() {
	const classes = useStyles()

	const {isOwner, roomId, schedules} = useSelector(selectRoom)
	const dispatch = useDispatch()

	const [selectedDate, handleDateChange] = useState(null)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(undefined)
	
	function deleteDate(scheduleIndex) {
		const scheduleId = schedules[scheduleIndex]._id
		setLoading(true)
		setError(undefined)
		gameDeleteSchedule(roomId, scheduleId)
			.then(() => {
				dispatch(updateSchedule())
			}).catch(err => {
				setError(err.message)
				console.error(err)
			}).finally(() => {
				setLoading(false)
			})
	}
	
	function sendDate(event) {
		event.preventDefault()
		event.stopPropagation()
		if(!selectedDate) {
			return
		}
		setLoading(true)
		setError(undefined)
		gameMakeSchedule(roomId, selectedDate)
			.then(() => {
				dispatch(updateSchedule())
				handleDateChange(null)
			}).catch(err => {
				setError(err.message)
				console.error(err)
			}).finally(() => {
				setLoading(false)
			})
	}
	if(undefined) sendDate()

	return (
		<Box className={classes.container}> 
			<Typography variant="h5"> Schedules </Typography>
			{ 
				error ?
					<Alert severity="error" className={classes.error}>
						{ error }
					</Alert>
					: undefined
			}
			<List className={classes.list}>
				{
					schedules.map((a, i) => (
						<React.Fragment key={a._id}>
							<ListItem>
								<ListItemText> 
									<Alert
										onClose={isOwner ? () => deleteDate(i) : undefined}
										severity="info"
										icon={<Icon>alarm</Icon>}>{moment(a.fromDate).calendar()}</Alert>
								</ListItemText>
							</ListItem>
						</React.Fragment>
					))
				}
			</List>

			{ 
				isOwner ?
					<Box display="flex" flexDirection="column">
						<DateTimePicker
							disabled={loading}
							autoOk
							hideTabs
							fullWidth
							disablePast
							ampm={false}
							margin="normal"
							variant="inline"
							inputVariant="filled"
							value={selectedDate}
							onChange={handleDateChange}
							leftArrowButtonProps={{ 'aria-label': 'Prev month' }}
							rightArrowButtonProps={{ 'aria-label': 'Next month' }}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											disabled={loading}
											aria-label="event">
											<Icon> event </Icon>
										</IconButton>
										<IconButton
											disabled={loading}
											aria-label="send"
											onClick={sendDate}>
											<Icon> send </Icon>
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
					</Box>
					: undefined
			}
		</Box>
	)
}

export default RoomSchedule
