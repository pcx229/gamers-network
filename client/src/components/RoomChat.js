
import React, {useRef,useEffect, useState} from 'react'
import {Box, Popover, Divider, FilledInput, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import Icon from '@material-ui/core/Icon'
import {makeStyles} from '@material-ui/core/styles'
import Picker from 'emoji-picker-react'
import moment from 'moment'
import grey from '@material-ui/core/colors/grey'
import {ChatSocket} from '../services/chatSocket'
import {useDispatch, useSelector} from 'react-redux'
import {actionActiveMembersChanged, selectRoom} from '../state/roomSlice'
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
	},
	imageToUploadPick: {
		display: 'flex', 
		flexDirection: 'column', 
		alignItems: 'flex-end'
	},
	imageToUploadPickImage: {
		height: '150px', 
		width: '100%', 
		margin: '10px 0px', 
		//background: 'url(change-in-code-component-style) center/contain no-repeat'
	},
	dragAndDropArea: {
		width: '100%',
		height: '150px',
		padding: '10px',
		backgroundColor: 'lightgrey',
		'& *': {
			pointerEvents: 'none'
		}
	},
	dragAndDropAreaExplain: {
		width: '100%',
		height: '100%',
		border: '2px dashed gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column'
	},
	chatImage: {
		maxWidth: '100%',
		maxHeight: '150px',
		padding: '10px',
		cursor: 'pointer'
	}
}))

function RoomChat({roomId}) {
	const classes = useStyles()

	const {isMember} = useSelector(selectRoom)
	const dispatch = useDispatch()

	const [list, setList] = useState([])
	const [message, setMessage] = useState('')
	const [allowedToChat, setAllowedToChat] = useState(undefined)
	const [error, setError] = useState(undefined)
	const [loading, setLoading] = useState(false)

	const messagesListRef = useRef(undefined)
	const [canLoadMore, setCanLoadMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	const [imageToUploadFile, setImageToUploadFile] = useState(undefined)
	const [imageToUploadUrl, setImageToUploadUrl] = useState(undefined)
	const [imageDropAreaVisible, setImageDropAreaVisible] = useState(false)
	function uploadImageFile(file) {
		if(file) {
			if(file.size > 5000000) {
				alert('maximum image upload size is 5mb')
				return
			}
			const url = URL.createObjectURL(file)
			setImageToUploadFile(file)
			setImageToUploadUrl(url)
		}
	}
	function getImageAsBase64(file) {
		const reader = new FileReader()
		return new Promise((resolve, reject) => {
			reader.onload = ev => {
				resolve(ev.target.result)
			}
			reader.onerror = function (error) {
				reject(error)
			}
			reader.readAsDataURL(file)
		})
	}
	function openBase64ImageInNewTab(base64URL) {
		var newTab = window.open()
		newTab.document.body.style.margin = '0px'
		newTab.document.body.style.background = 'url(' + base64URL  + ') center/contain no-repeat'
	}

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
		const members = {
			callback(chatActiveMembers) {
				dispatch(actionActiveMembersChanged(chatActiveMembers))
			}
		}
		socket.OnActiveMembersChangedListener(members)
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
			socket.RemoveOnActiveMembersChangedListener(members)
			socket.Disconnect()
			clearInterval(scrollInterval)
		}
	}, [dispatch, roomId, isMember])

	async function sendMessage() {
		let msg = ''
		if(imageToUploadUrl) {
			const imageBytes = await getImageAsBase64(imageToUploadFile)
			msg += '!img ' + imageBytes
		}
		if(!message || message.trim() === '') {
			if(!imageToUploadUrl)
				return
		} else {
			if(imageToUploadUrl)
				msg += '\n'
			msg += message
		}
		setLoading(true)
		socket.SendMessage(msg, () => {
			setLoading(false)
			setMessage('')
			setImageToUploadUrl(undefined)
		})
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
								if(typeof m.message === 'string') {
									if(m.message.startsWith('!img ')) {
										const parts = m.message.split('\n')
										m.message = [ parts[0].replace(/^!img /g, ''), parts.slice(1).join('\n') ]
									}
								}
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
															{
																typeof m.message === 'object' ?
																	<>
																		<img className={classes.chatImage} src={m.message[0]} onClick={(event) => openBase64ImageInNewTab(event.target.src)} />
																		<br />
																		<span>{m.message[1]}</span>
																	</>
																	: 
																	m.message
															}
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

			{
				imageToUploadUrl ?
					<Box className={classes.imageToUploadPick}>
						<IconButton
							aria-label="cancel"
							disabled={loading}
							onClick={() => {
								setImageToUploadUrl(undefined)
							}} >
							<Icon> close </Icon>
						</IconButton>
						<span 
							className={classes.imageToUploadPickImage} 
							style={{
								background: 'url(' + imageToUploadUrl + ') center/contain no-repeat'
							}} />
					</Box>
					: undefined
			}
			
			{
				imageDropAreaVisible ?
					<Box 
						className={classes.dragAndDropArea}
						onDragEnter={(event) => {
							setImageToUploadUrl(undefined)
							event.stopPropagation()
							event.preventDefault()
						}}
						onDragLeave={(event) => {
							setImageDropAreaVisible(false)
							event.stopPropagation()
							event.preventDefault()
						}}
						onDragOver={(event) => {
							event.stopPropagation()
							event.preventDefault()
						}}
						onDrop={(event) => {
							setImageDropAreaVisible(false)
							event.stopPropagation()
							event.preventDefault()
							const [file] = event.dataTransfer.files
							uploadImageFile(file)
						}}>
						<Box className={classes.dragAndDropAreaExplain}>
							<Icon>upload_file</Icon>
							<Typography variant="caption">drop an image to upload</Typography>
						</Box>
					</Box>
					: 
					<FilledInput 
						onDragEnter={(event) => {
							setImageDropAreaVisible(true)
							event.stopPropagation()
							event.preventDefault()
						}}
						onPaste={(event) => {
							var items = event.clipboardData.items
							for (var i = 0; i < items.length; i++) {
								if (items[i].type.indexOf('image') == -1) continue
								var file = items[i].getAsFile()
								uploadImageFile(file)
							}
						}}
						fullWidth
						variant="filled"
						multiline
						rowsMax={6}
						placeholder="Type your message here"
						disabled={!allowedToChat || loading}
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						inputProps={{
							'aria-label': 'description',
							onKeyPress: (event) => (event.key === 'Enter' && sendMessage())
						}}
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
								<input 
									id="image-for-chat-upload-button"
									type="file" 
									accept="image/*"
									hidden
									onClick={(event) => {
										event.target.value = ''
										setImageToUploadUrl(undefined)
									}}
									onChange={(event) => {
										const [file] = event.target.files
										uploadImageFile(file)
									}} />
								<label 
									htmlFor="image-for-chat-upload-button"
									style={{ margin: '0px' }}>
									<IconButton
										aria-label="image"
										disabled={!allowedToChat}
										component="span">
										<Icon> image </Icon>
									</IconButton>
								</label> 
								<IconButton
									aria-label="send"
									onClick={() => sendMessage()}
									disabled={!allowedToChat}>
									<Icon> send </Icon>
								</IconButton>
							</>
						} />
			}
			
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