import {Box, Button, Card, CardContent, CircularProgress, Grid, Typography} from '@material-ui/core'
import React, {useState, useEffect} from 'react'
import {getGameCoverUrl} from '../services/gamesAPI'
import {useHistory, useParams} from 'react-router-dom'
import {inviteExist, inviteStatus, info as roomInfo} from '../services/roomAPI'
  
function Invite() {
	const { roomId, code } = useParams()

	const history = useHistory()

	const [loading, setLoading] = useState(true)

	const [info, setInfo] = useState(undefined)

	useEffect(async () => {
		setLoading(true)
		// check if invite exist
		try {
			await inviteExist(roomId, code)
		} catch(err) {
			window.location = '/410.html'
			return
		}
		// room info
		try {
			setInfo((await roomInfo(roomId)).data)
			setLoading(false)
		} catch(err) {
			window.location = '/503.html'
			return
		}
	}, [roomId, code])

	function accept() {
		inviteStatus(roomId, code, true)
			.then(() => {
				history.push('/room/' + roomId)
			})
			.catch(() => {
				window.location = '/503.html'
			})
	}

	function reject() {
		inviteStatus(roomId, code, false)
			.then(() => {
				history.push('/')
			})
			.catch(() => {
				window.location = '/503.html'
			})
	}

	if(loading) {
		return (
			<>
				<Box textAlign="center" m={3}>
					<CircularProgress />
				</Box>
			</>
		)
	}

	return (
		<Grid container
			direction="row"
			justify="center"
			alignItems="center"
			spacing={5}
			style={{height: '100%'}}>
			<Grid item>
				<Typography style={{color: 'white'}} variant="h4" color="textPrimary">Want to join us?</Typography>
				<Box height="20px" />
				<Card variant="outlined">
					<CardContent style={{width: '400px'}}>
						<Grid container direction="row" spacing={3}>
							<Grid item md={4}>
								<img style={{width: '100%'}} src={getGameCoverUrl(info.game)} alt="cover" />
							</Grid>
							<Grid item md={8}>
								<Typography variant="h6">{info.name}</Typography>
								<Typography variant="subtitle2">{info.game} - {info.platform}</Typography>
								{
									info.description && info.description.trim() !== '' ?
										<>
											<Typography variant="caption">description</Typography>
											<br />
											<Typography variant="subtitle1">{info.description}</Typography>
										</>
										: undefined
								}
							</Grid>
						</Grid>
					</CardContent>
				</Card>
				<Box height="20px" />
				<Grid container direction="row" spacing={3} justify="center">
					<Grid item>
						<Button onClick={() => accept()} style={{width: '160px'}} variant="contained" color="primary"> Yes </Button>
					</Grid>
					<Grid item>
						<Button onClick={() => reject()} variant="outlined" color="secondary"> No </Button>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<img src={process.env.PUBLIC_URL + '/images/welcome.gif'} />
			</Grid>
		</Grid>
	)
}

export default Invite