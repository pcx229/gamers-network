import {makeStyles} from '@material-ui/core'
import React from 'react'

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
		margin: '0 auto',
		color: 'white',
		maxWidth: '992px'
	},
	left: {
		textAlign: 'left'
	},
	right: {
		textAlign: 'left'
	},
	'@media (max-width: 800px)': {
		center: {
			display: 'flex',
			flexDirection: 'column'
		},
		left: {
			minWidth: '100%',
			marginBottom: '30px',
			textAlign: 'center'
		},
		right: {
			minWidth: '100%',
			textAlign: 'center'
		}
	},
	accent: {
		color: '#ffa800'
	}
}))

function Footer() {
	const classes = useStyles()

	return (
		<div className={classes.container}>
			<div className={classes.center}>
				<div className={classes.left}>
					<b className={classes.accent}>PlayTogether</b> is a free LFG app for finding
					gamer friends<br />
					getting personal game recommendations<br />
					and coordinating gameplay sessions with non-toxic people
				</div>
				<div className={classes.right}>
					<img src={ process.env.PUBLIC_URL + '/images/telhai-logo.png'} height="20px" alt="telhai collage" />
					<br />© 2021 All rights reserved. <br />
					<b className={classes.accent}> Terms & Conditions | Privacy Policy</b>
				</div>
			</div>
		</div>
	)
}


export default Footer