
import React, {useState} from 'react'
import {Box, Popover, FilledInput, IconButton, List, ListItem, ListItemText, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import {makeStyles} from '@material-ui/core/styles'
import Icon from '@material-ui/core/Icon'
import Picker from 'emoji-picker-react'
import {useDispatch, useSelector} from 'react-redux'
import {updateAnnouncement, selectRoom} from '../state/roomSlice'
import {
	announce as gameMakeAnnouncement, 
	deleteAnnouncement as gameDeleteAnnouncement
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

function RoomAnnouncements() {
	const classes = useStyles()

	const {isOwner, roomId, announcements} = useSelector(selectRoom)
	const dispatch = useDispatch()

	const [message, setMessage] = useState('')

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(undefined)

	const [openEmojiPopover, setOpenEmojiPopover] = useState(false)
	const [emojiPopoverAnchorEl, setEmojiPopoverAnchorEl] = useState(null)
	const onEmojiClick = (event, emojiObject) => {
		if (emojiObject !== undefined && emojiObject.emoji !== undefined) {
			setMessage(message + emojiObject.emoji)
		}
		setOpenEmojiPopover(false)
	}
	
	function deleteMessage(announcementIndex) {
		const announcementId = announcements[announcementIndex]._id
		setLoading(true)
		setError(undefined)
		gameDeleteAnnouncement(roomId, announcementId)
			.then(() => {
				dispatch(updateAnnouncement())
			}).catch(err => {
				setError(err.message)
				console.error(err)
			}).finally(() => {
				setLoading(false)
			})
	}
	
	function sendMessage() {
		if(!message || message.trim() === '') {
			return
		}
		setLoading(true)
		setError(undefined)
		gameMakeAnnouncement(roomId, message)
			.then(() => {
				dispatch(updateAnnouncement())
				setMessage('')
			}).catch(err => {
				setError(err.message)
				console.error(err)
			}).finally(() => {
				setLoading(false)
			})
	}

	return (
		<Box className={classes.container}> 
			<Typography variant="h5"> Announcements </Typography>
			{ 
				error ?
					<Alert severity="error" className={classes.error}>
						{ error }
					</Alert>
					: undefined
			}
			<List className={classes.list}>
				{
					announcements.map((a, i) => (
						<React.Fragment key={a._id}>
							<ListItem>
								<ListItemText> 
									<Alert
										onClose={isOwner ? () => deleteMessage(i) : undefined}
										severity="success"
										icon={<Icon>campaign</Icon>}>{a.message}</Alert>
								</ListItemText>
							</ListItem>
						</React.Fragment>
					))
				}
			</List>

			{ 
				isOwner ?
					<>
						<FilledInput
							fullWidth
							variant="filled"
							multiline
							placeholder="Type your message here"
							disabled={loading}
							rowsMax={6}
							value={message}
							onChange={(event) => setMessage(event.target.value)}
							inputProps={{'aria-label': 'description'}}
							endAdornment={
								<>
									<IconButton
										aria-label="emoji"
										onClick={(event) => {
											setOpenEmojiPopover(true)
											setEmojiPopoverAnchorEl(event.currentTarget)
										}}
										disabled={loading}>
										<Icon> sentiment_satisfied_alt </Icon>
									</IconButton>
									<IconButton
										aria-label="send"
										onClick={() => sendMessage()}
										disabled={loading}>
										<Icon> send </Icon>
									</IconButton>
								</>
							} />
						<Popover 
							onClose={onEmojiClick}  
							open={openEmojiPopover}
							anchorEl={emojiPopoverAnchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'center',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'center',
							}} >
							<Picker style={classes.emoji} onEmojiClick={onEmojiClick} />
						</Popover>
					</>
					: undefined
			}
		</Box>
	)
}

export default RoomAnnouncements