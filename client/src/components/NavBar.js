import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import {useSelector} from 'react-redux'
import {selectUser} from '../state/userSlice'
import {Drawer, Icon, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles, Typography} from '@material-ui/core'

const useStyles = makeStyles(() => ({
	container: {
		backgroundColor: '#18213080',
		width: '100%'
	},
	center: {
		height: 'max-content',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignContent: 'center',
		padding: '10px',
		color: '#d2a434',
		margin: '0 auto',
		maxWidth: '992px'
	},
	logo: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '55px',
		'& img': {
			width: '450px'
		}
	},
	links: {
		'& ul': {
			listStyleType: 'none', 
		},
		'& li': {
			display: 'inline-block',
			marginRight: '30px'
		},
		'& a': {
			color: 'inherit',
			textDecoration: 'none',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center'
		}
	},
	small: {
		display: 'none'
	},
	'@media (max-width: 992px)': {
		links: {
			display: 'none'
		},
		small: {
			display: 'block'
		},
		logo: {
			margin: '0 auto',
			'& img': {
				width: '70%',
				minWidth: '250px'
			}
		}
	}
}))

function NavBar() {
	const classes = useStyles()

	const { user } = useSelector(selectUser)

	const [smallMenuDrawer, setSmallMenuDrawer] = useState(false)
	
	const toggleSmallMenuDrawer = (open) => (event) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return
		}
		setSmallMenuDrawer(open)
	}

	const links = [ 
		{ name: 'Home', icon: '/images/home_icon.png' ,link: '/' },
		{ name: 'Contact Us', icon: '/images/about_icon.png', link: '/contact' },
		{ name: 'Search', icon: '/images/search_icon.png', link: '/search' }
	]

	if(user) {
		links.push({ name: 'Profile', icon: '/images/login_icon.png', link: '/profile/' + user.id })
	} else {
		links.push({ name: 'Login', icon: '/images/login_icon.png', link: '/login' })
	}

	return (
		<div className={classes.container}>
			<div className={classes.center}>
				<div className={classes.logo}>
					<Link to='/'>
						<img src={ process.env.PUBLIC_URL + '/images/logo.png'} alt="logo" />
					</Link>
				</div>
				<div className={classes.links}>
					<ul>
						{ 
							links.map((l) => (
								<li key={l.link}>
									<Link to={l.link}>
										<img src={ process.env.PUBLIC_URL + l.icon} alt={l.name} /> &nbsp; &nbsp;
										{l.name.toUpperCase()}
									</Link>
								</li>
							))
						}
					</ul>
				</div>
				<div className={classes.small}>
					<IconButton color="inherit" aria-label="menu" onClick={toggleSmallMenuDrawer(true)}>
						<Icon>menu</Icon>
					</IconButton>
					<Drawer anchor={'right'} open={smallMenuDrawer} onClose={toggleSmallMenuDrawer(false)}>
						<List>
							<Typography variant="h5" align="center">Menu</Typography>
							{links.map((l) => (
								<Link key={l.link} to={l.link} style={{textDecoration: 'none'}} onClick={toggleSmallMenuDrawer(false)}>
									<ListItem button>
										<ListItemIcon>
											<img src={ process.env.PUBLIC_URL + l.icon} alt={l.name} />
										</ListItemIcon>
										<ListItemText primary={l.name} />
									</ListItem>
								</Link>
							))}
						</List>
					</Drawer>
				</div>
			</div>
		</div>
	)
}


export default NavBar