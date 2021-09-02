import { Grid, Icon, List, ListItem, makeStyles, Typography} from '@material-ui/core'
import {getGameCoverUrl} from '../services/gamesAPI'
import {useHistory} from 'react-router-dom'
import React from 'react'

const useStyles = makeStyles((theme) => ({
	room: {
		backgroundColor: theme.palette.background.default,
		color: theme.palette.text.primary,
		marginBottom: '10px',
		cursor: 'pointer'
	},
	cover: {
		minWidth: '100px',
		maxWidth: '200px',
		width: '100%'
	},
	infoContainer: {
		width: 'inherit'
	},
	name: {
		fontWeight: 'bold',
		fontSize: '1.3rem'
	},
	members: {
		display: 'flex',
		alignItems: 'center',
		fontSize: '1rem'
	}
}))

export default function SearchRoomsList({rooms}) {
	const classes = useStyles()
	const history = useHistory()

	if(!rooms) {
		return undefined
	}

	return (
		<List>
			{
				rooms.map(room => {
					return (
						<ListItem key={room._id} className={classes.room} onClick={() => history.push('/room/' + room._id)}>
							<Grid container spacing={2} direction="row" justify="center">
								<Grid item sm={3}>
									<img className={classes.cover} src={getGameCoverUrl(room.game)} alt="game cover" />
								</Grid>
								<Grid item sm={9} className={classes.infoContainer}>
									<Grid container direction="row" justify="space-between">
										<Grid item>
											<Typography variant="body1" className={classes.name}>{room.name}</Typography>
											<Typography variant="caption">#id {room._id}</Typography>
										</Grid>
										<Grid item>
											<Typography className={classes.members}><Icon>group</Icon>&nbsp;{room.members ? room.members : 0}</Typography>
										</Grid>
									</Grid>
									<Grid container direction="row" justify="space-between">
										<Grid item>
											<Typography variant="subtitle2">{room.game}</Typography>
										</Grid>
										<Grid item>
											<Typography variant="subtitle2">{room.platform}</Typography>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</ListItem>
					)
				})
			}
		</List>
	)
}