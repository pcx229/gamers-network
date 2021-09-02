
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import { 
	info as profileInfo, 
	gamesList as profileGamesList,
	addGame as profileAddGame,
	deleteGame as profileDeleteGame,
	addFriend as profileAddFriend,
	deleteFriend as profileDeleteFriend,
	friendsList as profileFriendsList
} from '../services/profileAPI'
import { 
	list as profileRoomsList
} from '../services/roomAPI'

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async ({profileId, myUserId}, thunkApi) => {
	try {
		let info
		try {
			info = (await profileInfo(profileId)).data
			if(info.birthday) {
				info.birthday = String(info.birthday)
			}
		} catch(e) {
			console.log(e)
			window.location = '/404.html'
			return
		}
		let isOwner = false
		if(myUserId) {
			if(myUserId === info.userId) {
				isOwner = true
			}
		}
		const games = (await profileGamesList(profileId)).data
		const friends = (await profileFriendsList(profileId)).data
		const rooms = (await profileRoomsList(profileId)).data
		return {profileId, myUserId, info, isOwner, games, friends, rooms}
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const updateGames = createAsyncThunk('profile/updateGames', async (_, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		const games = (await profileGamesList(profileId)).data
		return games
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const addGame = createAsyncThunk('profile/addGame', async ({name, platform}, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		await profileAddGame(name, platform)
		const games = (await profileGamesList(profileId)).data
		return games
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const deleteGame = createAsyncThunk('profile/deleteGame', async (gameId, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		await profileDeleteGame(gameId)
		const games = (await profileGamesList(profileId)).data
		return games
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const updateFriends = createAsyncThunk('profile/updateFriends', async (_, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		const friends = (await profileFriendsList(profileId)).data
		return friends
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const addFriend = createAsyncThunk('profile/addFriend', async (friendUserEmail, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		await profileAddFriend(friendUserEmail)
		const friends = (await profileFriendsList(profileId)).data
		return friends
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const deleteFriend = createAsyncThunk('profile/deleteFriend', async (friendId, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		await profileDeleteFriend(friendId)
		const friends = (await profileFriendsList(profileId)).data
		return friends
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const updateRooms = createAsyncThunk('profile/updateRooms', async (_, thunkApi) => {
	try {
		const profileId = thunkApi.getState().profile.profileId
		const rooms = (await profileRoomsList(profileId)).data
		return rooms
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

const initialState = {
	myUserId: undefined,
	profileId: undefined,
	userId: undefined,
	name: undefined,
	email: undefined,
	birthday: undefined,
	country: undefined,
	status: undefined,
	image: undefined,
	isOwner: undefined,
	friends: undefined,
	games: undefined,
	rooms: undefined,
	loading: true,
	error: undefined
}

const profileSlice = createSlice({
	name: 'profile',
	initialState,
	reducers: {
		afterEditProfile: (state, action) => {
			const {name, image, birthday, country, status} = action.payload
			state.name = name
			state.image = image
			state.birthday = birthday
			state.country = country
			state.status = status
			state.loading = false
		}
	},
	extraReducers: {
		[fetchProfile.pending]: (state) => {
			state.loading = true
			state.error = undefined
		},
		[fetchProfile.fulfilled]: (state, action) => {
			const {profileId, myUserId, info, isOwner, games, friends, rooms} = action.payload
			state.myUserId = myUserId
			state.profileId = profileId
			state.userId = info.userId
			state.name = info.name
			state.email = info.email
			state.birthday = info.birthday
			state.country = info.country
			state.status = info.status
			state.image = info.image
			state.games = games
			state.friends = friends
			state.rooms = rooms
			state.isOwner = isOwner
			state.loading = false
		},
		[fetchProfile.rejected]: (state, action) => {
			state.error = action.payload
			state.loading = false
		},

		[updateGames.fulfilled]: (state, action) => {
			const games = action.payload
			state.games = games
		},
		[updateGames.rejected]: (state, action) => {
			state.error = action.payload
		},

		[addGame.fulfilled]: (state, action) => {
			const games = action.payload
			state.games = games
		},
		[addGame.rejected]: (state, action) => {
			state.error = action.payload
		},

		[deleteGame.fulfilled]: (state, action) => {
			const games = action.payload
			state.games = games
		},
		[deleteGame.rejected]: (state, action) => {
			state.error = action.payload
		},

		[updateFriends.fulfilled]: (state, action) => {
			const friends = action.payload
			state.friends = friends
		},
		[updateFriends.rejected]: (state, action) => {
			state.error = action.payload
		},

		[addFriend.fulfilled]: (state, action) => {
			const friends = action.payload
			state.friends = friends
		},
		[addFriend.rejected]: (state, action) => {
			state.error = action.payload
		},

		[deleteFriend.fulfilled]: (state, action) => {
			const friends = action.payload
			state.friends = friends
		},
		[deleteFriend.rejected]: (state, action) => {
			state.error = action.payload
		},

		[updateRooms.fulfilled]: (state, action) => {
			const rooms = action.payload
			state.rooms = rooms
		},
		[updateRooms.rejected]: (state, action) => {
			state.error = action.payload
		},
	},
})

export const selectProfile = (state) => state.profile

export const actionAfterEditProfile = profileSlice.actions.afterEditProfile

export default profileSlice.reducer
