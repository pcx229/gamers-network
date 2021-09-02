import {ListItemAvatar, ListItemText} from '@material-ui/core'
import ProfileBasicList from './ProfileBasicList'
import {deleteFriend as deleteProfileFriend, selectProfile} from '../state/profileSlice'
import {useDispatch, useSelector} from 'react-redux'
import React, {useState} from 'react'
import UserAnimalAvatar from './UserAnimalAvatar'
import DialogAddFriendToProfile from './DialogAddFriendToProfile'
import {useHistory} from 'react-router-dom'

function ProfileFriendsList() {

	const history = useHistory()

	const {isOwner, friends} = useSelector(selectProfile)
	const dispatch = useDispatch()

	const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false)
	const [disableActions, setDisableActions] = useState(false)

	function addItem() {
		setAddFriendDialogOpen(true)
	}

	function deleteItem(i) {
		setDisableActions(true)
		dispatch(deleteProfileFriend(i._id))
			.catch((err) => {
				console.error(err)
			})
			.finally(() => {
				setDisableActions(false)
			})
	}

	function goToProfile(profile) {
		history.push('/profile/' + profile.userId)
	}

	return (
		<>
			<ProfileBasicList 
				title="Friends"
				list={friends}
				disabled={disableActions}
				itemId={item => item._id}
				itemComponent={ item => {
					return (
						<>
							<ListItemAvatar>
								<UserAnimalAvatar size="30px" username={item.name} src={item.image} />
							</ListItemAvatar>
							<ListItemText primary={item.name} secondary={item.email} />
						</>
					)
				}} 
				controls={isOwner} 
				onAdd={addItem}
				onDelete={deleteItem}
				onClick={goToProfile}
			/>
			<DialogAddFriendToProfile open={addFriendDialogOpen} setOpen={setAddFriendDialogOpen} />
		</>
	)
}

export default ProfileFriendsList