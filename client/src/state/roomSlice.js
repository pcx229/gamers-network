
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
	info as roomInfo, 
	members as roomMembers, 
	isMember as roomIsMember,
	announcements as roomAnnouncements, 
	schedules as roomSchedules,
	deleteRoom as roomDeleteRoom,
	leave as roomLeaveRoom,
	join as roomJoinRoom,
	schedule as roomMakeSchedule,
	deleteSchedule as roomDeleteSchedule,
	announce as roomMakeAnnouncement, 
	deleteAnnouncement as roomDeleteAnnouncement,
	edit as roomEditRoom,
	kickUser as roomKickUser,
	invites as roomGetInvites,
	invite as roomInvite,
	deleteInvite as roomDeleteInvite
} from '../services/roomAPI'

export const fetchRoom = createAsyncThunk('room/fetchRoom', async ({roomId, userId}, thunkApi) => {
	try {
		let info
		try {
			info = (await roomInfo(roomId)).data
		} catch(err) {
			console.log(err)
			window.location = '/404.html'
			return
		}
		let isPrivate = false
		if(info.private !== undefined && info.private === true) {
			isPrivate = true
			try {
				await roomIsMember(roomId)
			} catch(err) {
				console.log(err)
				window.location = '/403.html'
				return
			}
		}
		const members = (await roomMembers(roomId)).data
		let isOwner = false, isMember = false
		if(userId) {
			if(userId === info.creator) {
				isOwner = true
			}
			members.forEach(m => {
				if(userId === m.userId) {
					isMember = true
				}
			})
		}
		const creator_info = members.filter(m => m.userId === info.creator)[0]
		const announcements = (await roomAnnouncements(roomId)).data
		const schedules = (await roomSchedules(roomId)).data
		return {roomId, userId, info, members, creator_info, isOwner, isMember, isPrivate, announcements, schedules}
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const updateSchedule = createAsyncThunk('room/updateSchedule', async (fromDate, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		const schedules = (await roomSchedules(roomId)).data
		return schedules
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const makeSchedule = createAsyncThunk('room/makeSchedule', async (fromDate, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomMakeSchedule(roomId, fromDate)
		const schedules = (await roomSchedules(roomId)).data
		return schedules
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const deleteSchedule = createAsyncThunk('room/deleteSchedule', async (scheduleId, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomDeleteSchedule(roomId, scheduleId)
		const schedules = (await roomSchedules(roomId)).data
		return schedules
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const updateAnnouncement = createAsyncThunk('room/updateAnnouncement', async (message, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		const announcements = (await roomAnnouncements(roomId)).data
		return announcements
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const makeAnnouncement = createAsyncThunk('room/makeAnnouncement', async (message, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomMakeAnnouncement(roomId, message)
		const announcements = (await roomAnnouncements(roomId)).data
		return announcements
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const deleteAnnouncement = createAsyncThunk('room/deleteAnnouncement', async (announcementId, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomDeleteAnnouncement(roomId, announcementId)
		const announcements = (await roomAnnouncements(roomId)).data
		return announcements
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const actionChangeRoomMembership = createAsyncThunk('room/actionChangeRoomMembership', async (_, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		const members = (await roomMembers(roomId)).data
		return members
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const actionJoinRoom = createAsyncThunk('room/actionJoinRoom', async (_, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomJoinRoom(roomId)
		const members = (await roomMembers(roomId)).data
		return members
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const actionLeaveRoom = createAsyncThunk('room/actionLeaveRoom', async (_, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomLeaveRoom(roomId)
		const members = (await roomMembers(roomId)).data
		return members
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const actionKickUser = createAsyncThunk('room/actionKickUser', async (userId, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomKickUser(roomId, userId)
		const members = (await roomMembers(roomId)).data
		return members
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const actionDeleteRoom = createAsyncThunk('room/actionDeleteRoom', async (_, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomDeleteRoom(roomId)
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const actionEditRoom = createAsyncThunk('room/actionEditRoom', async ({name, game, platform, description, isPrivate}, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomEditRoom(roomId, name, game, platform, description, isPrivate)
		return {name, game, platform, description, isPrivate}
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const loadInvites = createAsyncThunk('room/loadInvites', async (_, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		const invites = (await roomGetInvites(roomId)).data
		return invites
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const makeInvite = createAsyncThunk('room/makeInvite', async (userEmail, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomInvite(roomId, userEmail)
		const invites = (await roomGetInvites(roomId)).data
		return invites
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

export const deleteInvite = createAsyncThunk('room/deleteInvite', async (inviteId, thunkApi) => {
	try {
		const roomId = thunkApi.getState().room.roomId
		await roomDeleteInvite(roomId, inviteId)
		const invites = (await roomGetInvites(roomId)).data
		return invites
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

const initialState = {
	roomId: undefined,
	userId: undefined,
	name: undefined,
	game: undefined,
	creator: undefined,
	creator_info: undefined,
	platform: undefined,
	description: undefined,
	isOwner: undefined,
	isMember: undefined,
	isPrivate: undefined,
	members: undefined,
	announcements: undefined,
	schedules: undefined,
	invites: undefined,
	loading: true,
	error: undefined
}

const roomSlice = createSlice({
	name: 'room',
	initialState,
	reducers: {
		afterEditRoom: (state, action) => {
			const {name, game, platform, description, isPrivate} = action.payload
			state.name = name
			state.game = game
			state.platform = platform
			state.description = description
			state.isPrivate = isPrivate
			state.loading = false
		}
	},
	extraReducers: {
		[fetchRoom.pending]: (state) => {
			state.loading = true
		},
		[fetchRoom.fulfilled]: (state, action) => {
			const {roomId, userId, info, members, creator_info, isOwner, isMember, isPrivate, announcements, schedules} = action.payload
			state.roomId = roomId
			state.userId = userId
			state.name = info.name
			state.game = info.game
			state.creator = info.creator
			state.creator_info = creator_info
			state.platform = info.platform
			state.description = info.description
			state.isOwner = isOwner
			state.isMember = isMember
			state.isPrivate = isPrivate
			state.members = members
			state.announcements = announcements
			state.schedules = schedules
			state.loading = false
		},
		[fetchRoom.rejected]: (state, action) => {
			state.error = action.payload
			state.loading = false
		},

		[updateSchedule.fulfilled]: (state, action) => {
			const schedules = action.payload
			state.schedules = schedules
		},
		[updateSchedule.rejected]: (state, action) => {
			state.error = action.payload
		},

		[makeSchedule.fulfilled]: (state, action) => {
			const schedules = action.payload
			state.schedules = schedules
		},
		[makeSchedule.rejected]: (state, action) => {
			state.error = action.payload
		},

		[deleteSchedule.fulfilled]: (state, action) => {
			const schedules = action.payload
			state.schedules = schedules
		},
		[deleteSchedule.rejected]: (state, action) => {
			state.error = action.payload
		},

		[updateAnnouncement.fulfilled]: (state, action) => {
			const announcements = action.payload
			state.announcements = announcements
		},
		[updateAnnouncement.rejected]: (state, action) => {
			state.error = action.payload
		},

		[makeAnnouncement.fulfilled]: (state, action) => {
			const announcements = action.payload
			state.announcements = announcements
		},
		[makeAnnouncement.rejected]: (state, action) => {
			state.error = action.payload
		},

		[deleteAnnouncement.fulfilled]: (state, action) => {
			const announcements = action.payload
			state.announcements = announcements
		},
		[deleteAnnouncement.rejected]: (state, action) => {
			state.error = action.payload
		},

		[loadInvites.fulfilled]: (state, action) => {
			const invites = action.payload
			state.invites = invites
		},
		[loadInvites.rejected]: (state, action) => {
			state.error = action.payload
		},

		[makeInvite.fulfilled]: (state, action) => {
			const invites = action.payload
			state.invites = invites
		},
		[makeInvite.rejected]: (state, action) => {
			state.error = action.payload
		},

		[deleteInvite.fulfilled]: (state, action) => {
			const invites = action.payload
			state.invites = invites
		},
		[deleteInvite.rejected]: (state, action) => {
			state.error = action.payload
		},

		[actionChangeRoomMembership.fulfilled]: (state, action) => {
			const members = action.payload
			if(state.userId) {
				state.isMember = false
				members.forEach(m => {
					if(state.userId === m.userId) {
						state.isMember = true
					}
				})
			}
			state.members = members
		},
		[actionChangeRoomMembership.rejected]: (state, action) => {
			state.error = action.payload
		},

		[actionJoinRoom.fulfilled]: (state, action) => {
			const members = action.payload
			state.isMember = true
			state.members = members
		},
		[actionJoinRoom.rejected]: (state, action) => {
			state.error = action.payload
		},

		[actionLeaveRoom.fulfilled]: (state, action) => {
			const members = action.payload
			state.isMember = false
			state.members = members
		},
		[actionLeaveRoom.rejected]: (state, action) => {
			state.error = action.payload
		},

		[actionKickUser.fulfilled]: (state, action) => {
			const members = action.payload
			state.members = members
		},
		[actionKickUser.rejected]: (state, action) => {
			state.error = action.payload
		},

		[actionDeleteRoom.fulfilled]: () => {
			window.location = '/'
		},
		[actionDeleteRoom.rejected]: (state, action) => {
			state.error = action.payload
		},

		[actionEditRoom.pending]: (state) => {
			state.loading = true
		},
		[actionEditRoom.fulfilled]: (state, action) => {
			const {name, game, platform, description, isPrivate} = action.payload
			state.name = name
			state.game = game
			state.platform = platform
			state.description = description
			state.isPrivate = isPrivate
			state.loading = false
		},
		[actionEditRoom.rejected]: (state, action) => {
			state.error = action.payload
			state.loading = false
		},
	},
})

export const selectRoom = (state) => state.room

export const actionAfterEditRoom = roomSlice.actions.afterEditRoom

export default roomSlice.reducer
