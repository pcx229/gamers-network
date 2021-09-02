
import React from 'react'
import NavBar from './NavBar'
import {makeStyles} from '@material-ui/core'
import Footer from './Footer'

const useStyles = makeStyles(() => ({
	'@global': {
		html: {
			background: 'black url(/images/background.png) center repeat'
		},
		body: {
			height: '100%',
			margin: '0',
			fontFamily: '\'Roboto\', sans-serif'
		},
		'#root': {
			height: '100%'
		}
	},
	container: {
		width: '100%',
		margin: '0 auto',
		height: '100vh',
		display: 'flex',
		flexDirection: 'column'
	},
	content: {
		flex: '1 0 auto'
	},
	footer: {
		flexShrink: '0',
		padding: '20px'
	}
}))

function MenuWithFooterAndBorderLayout({children}) {
	const classes = useStyles()

	return (
		<div className={classes.container}> 
			<div className={classes.header}> <NavBar/> </div>
			<div className={classes.content}> {children}  </div>
			<div className={classes.footer}> <Footer /> </div>
		</div>
	)
}

export default MenuWithFooterAndBorderLayout