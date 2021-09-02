
import React from 'react'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
	root: {
		height: '100vh',
	},
	centerVerticllyContainer: {
		height: '100%',
		display: 'grid',
	},
	centerVerticllyItem: {
		margin: 'auto'
	}
}))

function CenterVertically({children}) {
	const classes = useStyles()

	return (
		<div className={classes.centerVerticllyContainer}>
			<div className={classes.centerVerticllyItem}>
				{children}
			</div>
		</div>
	)
}

export default CenterVertically
