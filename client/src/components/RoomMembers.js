
import React, {useState} from 'react'
import { Badge, Box, Chip, Divider, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import {useSelector, useDispatch} from 'react-redux'
import {selectRoom, actionKickUser} from '../state/roomSlice'
import DialogInvite from './DialogInvite'
import UserAnimalAvatar from './UserAnimalAvatar'

const useStyles = makeStyles(() => ({
	container: {
		minWidth: '400px',
		height: '400px',
		display: 'flex',
		flexDirection: 'column'
	},
	list: {
		overflowY: 'auto'
	},
	title: {
		display: 'flex',
		justifyContent: 'space-between',
		marginRight: '10px'
	},
	memberImage: {
		backgroundColor: 'red'
	}
}))

function RoomMembers() {
	const classes = useStyles()

	const {userId, creator, members, activeMembers, isOwner, isPrivate} = useSelector(selectRoom)
	const dispatch = useDispatch()

	const activeMembersSet = new Set(activeMembers)

	const [openInviteDialog, setOpenInviteDialog] = useState(false)

	function kickUser(userId) {
		dispatch(actionKickUser(userId))
	}

	return (
		<Box className={classes.container}> 
			<Box className={classes.title}>
				<Typography variant="h5"> Members </Typography>
				{ isOwner && isPrivate ?
					<>
						<IconButton onClick={() => setOpenInviteDialog(true)} aria-label="invite friends">
							<Icon>person_add</Icon>
						</IconButton>
						<DialogInvite open={openInviteDialog} setOpen={setOpenInviteDialog} />
					</>
					: undefined
				}
			</Box>
			<List className={classes.list}>
				{
					members.map(m => (
						<React.Fragment key={m.userId}>
							<ListItem>
								<ListItemAvatar>
									<Badge
										anchorOrigin={{
											vertical: 'bottom',
											horizontal: 'right',
										}}
										badgeContent=" " 
										variant="dot"
										color="secondary"
										invisible={!activeMembers || !activeMembersSet.has(m.userId)}
									>
										<UserAnimalAvatar className={classes.memberImage} size={'40px'} username={m.name} src={m.image} />
									</Badge>
								</ListItemAvatar>
								<ListItemText 
									primary={m.name} />
								<ListItemSecondaryAction>
									{
										(m.userId === userId) ?
											<Chip size="small" label="me" variant="outlined" />
											: undefined
									}
									{
										(m.userId === creator) ?
											<Chip size="small" label="owner" variant="outlined" />
											: undefined
									}
									{
										(isPrivate && isOwner && (m.userId !== creator)) ?
											<>
												&nbsp;
												<IconButton edge="end" aria-label="kick" onClick={() => kickUser(m.userId)}>
													<Icon>remove_circle_outline</Icon>
												</IconButton>
											</>
											: undefined
									}
								</ListItemSecondaryAction>
							</ListItem>
							<Divider />
						</React.Fragment>
					))
				}
			</List>
		</Box>
	)
}

export default RoomMembers