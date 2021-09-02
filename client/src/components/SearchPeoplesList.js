import { Grid, List, ListItem, makeStyles, Typography} from '@material-ui/core'
import {useHistory} from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import UserAnimalAvatar from './UserAnimalAvatar'
import {getCountryByLabel} from '../util/countries'
import React from 'react'

const useStyles = makeStyles((theme) => ({
	person: {
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

export default function SearchPeoplesList({peoples}) {
	const classes = useStyles()
	const history = useHistory()

	if(!peoples) {
		return undefined
	}

	return (
		<List>
			{
				peoples.map(person => {
					return (
						<ListItem key={person._id} className={classes.person} onClick={() => history.push('/profile/' + person.userId)}>
							<Grid container spacing={2} direction="row" justify="center">
								<Grid item sm={2}>
									<Grid container direction="row" justify="center">
										<UserAnimalAvatar size="50px" username={person.name} src={person.image} />
									</Grid>
								</Grid>
								<Grid item sm={10} className={classes.infoContainer}>
									<Grid container direction="row" justify="space-between">
										<Grid item>
											<Typography variant="body1" className={classes.name}>{person.name}</Typography>
											<Typography variant="body2" color="textSecondary">{person.email}</Typography>
										</Grid>
									</Grid>
									{
										person.country ?
											<Grid container direction="row" justify="space-between">
												<Grid item>
													<Typography variant="subtitle2">
														<ReactCountryFlag svg countryCode={getCountryByLabel(person.country).code} />
													&nbsp;
														{person.country}
													</Typography>
												</Grid>
											</Grid>
											: undefined
									}
								</Grid>
							</Grid>
						</ListItem>
					)
				})
			}
		</List>
	)
}