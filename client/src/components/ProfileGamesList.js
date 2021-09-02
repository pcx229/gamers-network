import {ListItemAvatar, ListItemText} from '@material-ui/core'
import {getGameCoverUrl} from '../services/gamesAPI'
import ProfileBasicList from './ProfileBasicList'
import {deleteGame as deleteProfileGame, selectProfile} from '../state/profileSlice'
import {useDispatch, useSelector} from 'react-redux'
import React, {useState} from 'react'
import DialogAddGameToProfile from './DialogAddGameToProfile'

function ProfileGamesList() {

	const {isOwner, games} = useSelector(selectProfile)
	const dispatch = useDispatch()

	const [addGameDialogOpen, setAddGameDialogOpen] = useState(false)
	const [disableActions, setDisableActions] = useState(false)

	function addItem() {
		setAddGameDialogOpen(true)
	}

	function deleteItem(i) {
		setDisableActions(true)
		dispatch(deleteProfileGame(i._id))
			.catch((err) => {
				console.error(err)
			})
			.finally(() => {
				setDisableActions(false)
			})
	}

	return (
		<>
			<ProfileBasicList 
				title="Games"
				list={games}
				disabled={disableActions}
				itemId={item => item._id}
				itemComponent={ item => {
					return (
						<>
							<ListItemAvatar>
								<img style={{width: '120px', marginRight: '20px'}} src={getGameCoverUrl(item.game)} alt="cover"/>
							</ListItemAvatar>
							<ListItemText primary={item.game} secondary={item.platform} />
						</>
					)
				}} 
				controls={isOwner} 
				onAdd={addItem}
				onDelete={deleteItem}
				onClick={undefined}
			/>
			<DialogAddGameToProfile open={addGameDialogOpen} setOpen={setAddGameDialogOpen} />
		</>
	)
}

export default ProfileGamesList