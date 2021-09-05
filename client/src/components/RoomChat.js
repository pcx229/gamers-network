
import React, {useRef,useEffect, useState} from 'react'
import {Box, Popover, Divider, FilledInput, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import Icon from '@material-ui/core/Icon'
import {makeStyles} from '@material-ui/core/styles'
import Picker from 'emoji-picker-react'
import moment from 'moment'
import grey from '@material-ui/core/colors/grey'
import {ChatSocket} from '../services/chatSocket'
import {useSelector} from 'react-redux'
import {selectRoom} from '../state/roomSlice'
import UserAnimalAvatar from './UserAnimalAvatar'

const useStyles = makeStyles((theme) => ({
	container: {
		display: 'flex',
		flexDirection: 'column',
		height: '500px',
		minWidth: '400px'
	},
	error: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column-reverse'
	},
	list: {
		height: '100%',
		overflowY: 'scroll',
		display: 'flex',
		flexDirection: 'column-reverse'
	},
	loading: {
		justifyContent: 'center',
		padding: '20px',
		backgroundColor: grey[200],
		color: grey[700]
	},
	emoji: {
		position: 'fixed'
	},
	messageImageSmall: {
		width: '24px',
		height: '24px',
		backgroundColor: 'red'
	},
	messageText: {
		color: theme.palette.text.primary
	},
	messageInfo: {
		display: 'flex',
		justifyContent: 'space-between',
		color: theme.palette.text.secondary,
		fontSize: '0.875rem'
	}
}))

function RoomChat({roomId}) {
	const classes = useStyles()

	const {isMember} = useSelector(selectRoom)

	const [list, setList] = useState([])
	const [message, setMessage] = useState('')
	const [allowedToChat, setAllowedToChat] = useState(undefined)
	const [error, setError] = useState(undefined)

	const messagesListRef = useRef(undefined)
	const [canLoadMore, setCanLoadMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	const [socket, setSocket] = useState(undefined)

	const [openEmojiPopover, setOpenEmojiPopover] = useState(false)
	const [emojiPopoverAnchorEl, setEmojiPopoverAnchorEl] = useState(null)
	const onEmojiClick = (event, emojiObject) => {
		if (emojiObject !== undefined && emojiObject.emoji !== undefined) {
			setMessage(message + emojiObject.emoji)
		}
		setOpenEmojiPopover(false)
	}

	const [checkForScroll, setCheckForScroll] = useState(0)
	useEffect(() => {
		if(messagesListRef && messagesListRef.current) {
			const scrollTop = messagesListRef.current.scrollTop
			const top = messagesListRef.current.scrollHeight - messagesListRef.current.clientHeight
			if(canLoadMore && !isLoadingMore && top+scrollTop < 70 && list.length > 0) {
				setIsLoadingMore(true)
				socket.GetMore(list[list.length-1].seq)
			}
		}
	}, [socket, checkForScroll, messagesListRef, list, canLoadMore, isLoadingMore])

	useEffect(() => {
		if(roomId === undefined){
			return
		}
		// create socket
		const socket = ChatSocket(roomId)
		setSocket(socket)
		const error = (err) => {
			setError('was unable to establish a connection with the server (' + err.message + ')')
			setCanLoadMore(false)
		}
		socket.OnErrorListener(error)
		const status = (stat) => {
			if (stat === 'allowed to chat') {
				setAllowedToChat(true)
			} else {
				setAllowedToChat(false)
			}
		}
		socket.OnStatusListener(status)
		const disconnect = () => {
			setError('disconnected duo to invalid room id number or server problem, try refresh the page to reload the chat again.')
			setCanLoadMore(false)
		}
		socket.OnDisconnectedListener(disconnect)
		const message = (msgs) => {
			if(msgs.length === 0) {
				setCanLoadMore(false)
			}
			setList(list => [...msgs, ...list].sort((a, b) => b.seq - a.seq))
		}
		socket.OnMessageListener(message)
		const more = (msgs) => {
			setList(list => [...msgs, ...list].sort((a, b) => b.seq - a.seq))
			if (!msgs || msgs.length === 0) {
				setCanLoadMore(false)
			}
			setIsLoadingMore(false)
		}
		socket.OnMoreListener(more)
		const scrollInterval = setInterval(() => setCheckForScroll(Date.now()), 2000)
		return () => {
			setAllowedToChat(false)
			setCanLoadMore(true)
			setIsLoadingMore(false)
			setError(undefined)
			setMessage('')
			setList([])
			socket.RemoveOnErrorListener(error)
			socket.RemoveOnStatusListener(status)
			socket.RemoveOnDisconnectedListener(disconnect)
			socket.RemoveOnMessageListener(message)
			socket.RemoveOnMoreListener(more)
			socket.Disconnect()
			clearInterval(scrollInterval)
		}
	}, [roomId, isMember])

	function sendMessage() {
		if(!message || message.trim() === '') {
			return
		}
		socket.SendMessage(message)
		setMessage('')
	}

	return (
		<Box className={classes.container}>
			<Typography variant="h5"> Chat </Typography>
			{
				error ?
					<Box className={classes.error}>
						<Alert severity='error'> {error} </Alert>
					</Box>
					:
					<List 
						dense={true} 
						className={classes.list} 
						ref={messagesListRef}>
						{
							list.map(m => {
								return (
									<React.Fragment key={m.id}>
										<ListItem alignItems="flex-start">
											<ListItemAvatar>
												<UserAnimalAvatar className={classes.messageImageSmall} size={'25px'} username={m.name} src={m.image} />
											</ListItemAvatar>
											<ListItemText
												primary={
													<>
														<span className={classes.messageInfo}>
															<span> {m.name} </span>
															<span> {moment(m.time).calendar()} </span>
														</span>
													</>
												}
												secondary={
													<>
														<span className={classes.messageText}>
															{m.message}
														</span>
													</>
												}
											/>
										</ListItem>
										<Divider />
									</React.Fragment>
								)
							})
						}
						{
							canLoadMore && messagesListRef.current !== undefined && messagesListRef.current.scrollHeight > messagesListRef.current.clientHeight ?
								<>
									<ListItem alignItems="flex-start" className={classes.loading}>
										Loading...
									</ListItem>
									<Divider />
								</>
								: undefined
						}
					</List>
			}

			<FilledInput
				fullWidth
				variant="filled"
				multiline
				placeholder="Type your message here"
				disabled={!allowedToChat}
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
							disabled={!allowedToChat}>
							<Icon> sentiment_satisfied_alt </Icon>
						</IconButton>
						<IconButton
							aria-label="send"
							onClick={() => sendMessage()}
							disabled={!allowedToChat}>
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
		</Box>
	)
}

export default RoomChat