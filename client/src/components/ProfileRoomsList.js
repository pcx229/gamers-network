import {ListItemAvatar, ListItemText} from '@material-ui/core'
import {getGameCoverUrl} from '../services/gamesAPI'
import ProfileBasicList from './ProfileBasicList'
import {selectProfile, updateRooms} from '../state/profileSlice'
import {useDispatch, useSelector} from 'react-redux'
import React, {useState} from 'react'
import {DialogCreateRoom} from './DialogRoomBuilder'
import {useHistory} from 'react-router-dom'

function ProfileRoomsList() {

	const history = useHistory()

	const {isOwner, rooms} = useSelector(selectProfile)
	const dispatch = useDispatch()

	const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false)

	function addItem() {
		setAddRoomDialogOpen(true)
	}

	function goToRoom(room) {
		history.push('/room/' + room._id)
	}

	return (
		<>
			<ProfileBasicList 
				title="Rooms"
				list={rooms}
				itemId={item => item._id}
				itemComponent={ item => {
					return (
						<>
							<ListItemAvatar>
								<img style={{width: '120px', marginRight: '20px'}} src={getGameCoverUrl(item.game)} alt="cover"/>
							</ListItemAvatar>
							<ListItemText primary={item.name} secondary={item.game + ' - ' + item.platform} />
						</>
					)
				}} 
				controls={isOwner} 
				onAdd={addItem}
				onClick={goToRoom}
			/>
			<DialogCreateRoom 
				open={addRoomDialogOpen} 
				close={() => {
					setAddRoomDialogOpen(false)
					dispatch(updateRooms())
				}} />
		</>
	)
}

export default ProfileRoomsList