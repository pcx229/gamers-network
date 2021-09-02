import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import { Container, Grid, makeStyles, Typography} from '@material-ui/core'
import {getRandomGames} from '../services/gamesAPI'

const useStyles = makeStyles(() => ({
	intro: {
		width: '100%',
		backgroundColor: '#1e486480',
		color: 'white',
		padding: '20px 0'
	},
	games: {
		marginBottom: '40px'
	},
	game: {
		border: '2px solid #ffa800',
		margin: '5px',
		borderRadius: '8px',
		overflow: 'hidden'
	},
	gameInfo: {
		boxShadow: 'inset 0px -49px 11px -11px rgba(0,0,0,0.3)',
		position: 'relative',
		zIndex: '99',
		marginTop: '-30px',
		padding: '0 10px',
		color: 'white',
		width: '100%',
		fontWeight: 'bold'
	},
	newRoom: {
		width: '460px', 
		height: '215px', 
		display: 'flex', 
		flexDirection: 'column',
		justifyContent: 'center',
		background: 'linear-gradient(322deg, rgba(238,168,97,1) 19%, rgba(231,220,57,1) 54%, rgba(255,184,0,1) 100%)'
	},
	links: {
		color: 'white',
		marginBottom: '20px',
		'& > div': {
			marginBottom: '40px'
		}
	},
	accent: {
		color: '#ffa800'
	},
	'@media (max-width: 960px)': {
		intro: {
			width: 'inherit',
			padding: '0 20px'
		}
	}
}))

export default function Home() {
	const classes = useStyles()

	const [games, setGames] = useState(undefined)

	useEffect(() => {
		getRandomGames()
			.then(data => setGames(data.data))
			.catch((err) => console.error(err))
	}, [])

	return (
		<>
			<div className={classes.intro}>
				<Grid container justify="center" >
					<Grid item md={5}>
						<Typography variant="h3">
							<b className={classes.accent}>Gaming tournament</b> on one place
						</Typography>
						<Typography variant="h4">
							Ready to join?
						</Typography>
						<Typography variant="h3">
							<b className={classes.accent}> it’s free. </b>
						</Typography>
						<Typography variant="h6">
						Play Together is a social media platform with a goal to connect between peoples around the world who want
to play games together
						</Typography>
					</Grid>
					<Grid item>
						<img src={ process.env.PUBLIC_URL + '/images/ps5.png'} alt="Playstation 5 Controller" />
					</Grid>
				</Grid>
			</div>

			{ games !== undefined ?
				<div className={classes.games}>
					<Container>
						<Typography variant="h5"> 
							<b className={classes.accent}>Games</b>
						</Typography>
						<hr />
						<Grid container justify="center">
							{ games.map(g => (
								<Grid key={g.appid} item mx={2} className={classes.game}>
									<img src={g.image} alt="game cover" />
									<Typography className={classes.gameInfo}>
										{g.name}
									</Typography>
								</Grid>
							))}
							<Grid item mx={2} className={classes.game}>
								<Typography className={classes.newRoom} variant="h4" align="center">
									ADD <br/> 
									<b>NEW</b> <br/> 
									ROOM
								</Typography>
							</Grid>
						</Grid>
					</Container>
				</div>
				: undefined
			}

			<div className={classes.links}>
				<Container maxWidth="md">
					<Grid container direction="column" alignItems="center">
						<Grid item>
							<Typography variant="h2" align="center">
								NEVER <b className={classes.accent}>PLAY</b> ALONE.
							</Typography>
						</Grid>
						<Grid item>
							<Grid container spacing={4} display="flex" alignItems="center">
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/google_play_icon.png'} alt="google play store" /></Link>
								</Grid>
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/app_store_icon.png'} alt="apple app store" /></Link>
								</Grid>
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/webapp_ico.png'} alt="webapp" /></Link>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
					<Grid container direction="column" alignItems="center">
						<Grid item>
							<Typography variant="h2" align="center">
								<strong>We <span style={{ 'color': 'red' }}>♥</span> new friends!</strong>
							</Typography>
						</Grid>
						<Grid item>
							<Grid container direction="row" spacing={4} alignItems="center">
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/facebook_icon.png'} alt="facebook" /></Link>
								</Grid>
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/instagram_icon.png'} alt="instagram" /></Link>
								</Grid>
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/twitter_icon.png'} alt="twitter" /></Link>
								</Grid>
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/discord_icon.png'} alt="discord" /></Link>
								</Grid>
								<Grid item>
									<Link to="/"><img src={ process.env.PUBLIC_URL + '/images/youtube_icon.png'} alt="youtube" /></Link>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Container>
			</div>
		</>
	)
}
