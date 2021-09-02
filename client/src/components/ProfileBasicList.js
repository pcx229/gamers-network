import {Box, Button, CircularProgress, Divider, Grid, Icon, IconButton, List, ListItem, ListItemSecondaryAction, makeStyles, Paper, Typography} from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles(() => ({
	root: {
		padding: '10px', 
		margin: '10px'
	},
	listContainer: {
		align: 'center', 
		padding: '10px'
	}
}))

function ProfileBasicList({title, list, itemComponent, itemId, loading, controls, onAdd, onDelete, onClick, disabled}) {
	const classes = useStyles()

	return (
		<Paper className={classes.root}>
			<Grid container style={{padding: '5px'}} justify="space-between">
				<Grid item>
					<Typography variant="h5" color="textSecondary" >{title}</Typography>
				</Grid>
				{
					(controls && onAdd) ?
						<Grid item>
							<Button onClick={() => onAdd()} variant="contained" disabled={disabled} startIcon={<Icon>add</Icon>} size="small">Add</Button>
						</Grid>
						: undefined
				}
			</Grid>
			<Divider />
			<Box className={classes.listContainer}>
				{
					loading ?
						<CircularProgress color="primary"/>
						: 
						(list && list.length === 0) ?
							<Typography color="textPrimary" align="center">Empty</Typography>
							: 
							<List>
								{
									list ? list.map(i => {
										return (
											<ListItem key={itemId(i)} button={onClick !== undefined} onClick={() => (onClick !== undefined ? onClick(i) : undefined)}>
												{itemComponent(i)}
												{
													(controls && onDelete) ?
														<ListItemSecondaryAction>
															<IconButton onClick={() => onDelete(i)} edge="end" aria-label="delete" disabled={disabled}>
																<Icon>delete</Icon>
															</IconButton>
														</ListItemSecondaryAction>
														: undefined
												}
											</ListItem>
										)
									}) : undefined
								}
							</List>
				}
			</Box>
		</Paper>
	)
}

export default ProfileBasicList