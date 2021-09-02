import { Box, Button, CircularProgress, Container, Grid, Icon, makeStyles, Typography} from '@material-ui/core'
import React, {useEffect, useState} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import UserAnimalAvatar from '../components/UserAnimalAvatar'
import {useDispatch, useSelector} from 'react-redux'
import {selectUser} from '../state/userSlice'
import {fetchProfile, selectProfile} from '../state/profileSlice'
import {Alert} from '@material-ui/lab'
import ProfileGamesList from '../components/ProfileGamesList'
import ProfileFriendsList from '../components/ProfileFriendsList'
import ProfileRoomsList from '../components/ProfileRoomsList'
import DialogUpdateProfile from '../components/DialogUpdateProfile'
import ReactCountryFlag from 'react-country-flag'
import {getCountryByLabel} from '../util/countries'
import moment from 'moment'

const useStyles = makeStyles(() => ({
	avatarContainer: {
		display: 'flex',
		justifyContent: 'center',
		paddingTop: '20px',
		paddingBottom: '20px'
	},
	controls: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}))

export default function Profile() {
	const classes = useStyles()

	const {id} = useParams()
	const history = useHistory()

	const {user} = useSelector(selectUser)
	const {name, email, userId, image, birthday, country, status, isOwner, loading, error} = useSelector(selectProfile)
	const dispatch = useDispatch()

	const [dialogUpdateOpen, setDialogUpdateOpen] = useState(false)

	useEffect(() => {
		if(id) {
			dispatch(fetchProfile({profileId: id, myUserId: (user ? user.id : undefined)}))
		}
	}, [dispatch, user, id])

	if(loading) {
		return (
			<Box textAlign="center" m={3}>
				<CircularProgress />
			</Box>
		)
	}

	if(error) {
		return (
			<Alert severity="error">Error: fetching data for profile &quot;{id}&quot; failed [reason: {error}]</Alert>
		)
	}

	return (
		<>
			<Container maxWidth="md">
				{
					isOwner ?
						<Box className={classes.controls}>
							<Button onClick={() => setDialogUpdateOpen(true)} startIcon={<Icon>edit</Icon>}>Edit</Button>
							<DialogUpdateProfile open={dialogUpdateOpen} setOpen={setDialogUpdateOpen} />
							&nbsp;
							<Button onClick={() => history.push('/logout')} startIcon={<Icon>logout</Icon>}>Logout</Button>
						</Box>
						: undefined
				}
				<Grid container spacing={3}>
					<Grid item sm={6}>
						<Box className={classes.avatarContainer}>
							<UserAnimalAvatar size="150px" username={name} src={image} />
						</Box>
					</Grid>
					<Grid item sm={6}>
						<Typography color="textSecondary" variant="subtitle2">name</Typography>
						<Typography color="textPrimary" variant="h6">{name}</Typography>
						<Typography color="textSecondary" variant="subtitle2">id</Typography>
						<Typography color="textPrimary" variant="h6">{userId}</Typography>
						<Typography color="textSecondary" variant="subtitle2">email</Typography>
						<Typography color="textPrimary" variant="h6">{email}</Typography>
						{
							birthday ?
								<>
									<Typography color="textSecondary" variant="subtitle2">age</Typography>
									<Typography color="textPrimary" variant="h6">{ moment().diff(birthday, 'years')}</Typography>
								</>
								: undefined
						}
						{
							country ?
								<>
									<Typography color="textSecondary" variant="subtitle2">country</Typography>
									<Typography color="textPrimary" variant="h6">
										<ReactCountryFlag svg countryCode={getCountryByLabel(country).code} />
										&nbsp; &nbsp;
										{country}
									</Typography>
								</>
								: undefined
						}
						{
							(status && status !== '') ?
								<>
									<Typography color="textSecondary" variant="subtitle2">status</Typography>
									<Typography color="textPrimary" variant="h6">{status}</Typography>
								</>
								: undefined
						}
					</Grid>
				</Grid>
				<ProfileGamesList />
				<ProfileFriendsList />
				<ProfileRoomsList />
			</Container>
		</>
	)
}